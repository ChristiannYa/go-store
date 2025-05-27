const AuthContext = createContext(undefined);

export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};

const AuthProvider = ({ children }) => {
  // This token lives in state inside of this component
  // which is handled by the processors memory of the computer
  // running this app
  const [token, setToken] = useState(null);

  // This runs once on mount
  // It tries to fetch the user token from the api
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await api.get("/api/me");
        setToken(response.data.token); // This means that the user is authenticated
      } catch {
        // If user is not authenticated, set token to null
        // and this gets used by the rest of the app to
        // determine if the user is signed in or not
        setToken(null);
      }
    };

    fetchMe();
  }, []);

  /*
    * Reason why use layout effect is used instead of useEffect:
      - We want this to block the rest of the rendering because
        other components in the component tree are going to 
        trigger request and we want to guarantee that this interceptor
        is put before any of those components trigger a request


    * This has the job of taking the token, put it and
      inject it on every single request to the api
    * Runs initially once on mount and whenever the token changes
  */
  useLayoutEffect(() => {
    // This creates an interceptor for the actual request (using axios)
    const authInterceptor = api.interceptors.request.use((config) => {
      config.headers.Authorization =
        // We check config._retry and only if it is not there, we are actually
        // setting the token, otherwise we're putting the token of whatever was
        // there initially in the request
        !config._retry && token
          ? // If a token is present, add it to the authorization header of the request
            `Bearer ${token}`
          : // If no token is present, pass the authorization header as it was before
            config.headers.Authorization;
      return config;
    });

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  /*
    * Reason why use layout effect:
      - We want this interceptor to be there before any other component
        continues rendering. 
        And this one we are just doing it on the actua response

    * This handles the case when we either no longer have a token or
      this token is expired and we tried to send it through an interceptor
      through the initial interceptor above (the one defined inside the 
      useLayoutEffect above) on the request, but essentially the server said "hey this
      token either isn't there or it's expired, but i have a new valid refresh
      token so here is a new access token for you that you can use to re
      authenticate the user".
  */
  useLayoutEffect(() => {
    // This puts an interceptor on the response as opposed to the request.
    // And essentially do nothing with the response, but checking if there
    // an error
    const refreshInterceptor = api.interceptors.use(
      (response) => response,
      async (error) => {
        // Stores the original request from error.config
        const originalRequest = error.config;

        if (
          // These comes from the backend
          error.response.status === 403 &&
          error.response.data.message === "Unauthorized"
        ) {
          try {
            // Instead of signing the user out, we first wanna check if the actual
            // refresh token is still valid
            // The api will refresh the token of the user
            const response = await api.get("/api/refreshToken");

            // If there is an actual token, we wil set the token in the state
            // (replacing the existing token that was there before with the new
            // access token that we'd get from the api/refreshToken)
            setToken(response.data.accessToken);

            // The original request that we tried to fire initially that resulted
            // in this error (the 403 error because the access token was expired)
            // will add the token inside of the headers of the authorization
            originalRequest.headers = `Bearer ${response.data.accessToken}`;

            // Add custom underscore property to equal true because we want
            // the above useLayoutEffect to run when the token in its dependncy
            // array changes, and here we are setting this token to change, and
            // essentially we do not want the above useLayuout effect to overwrite
            // the token that we are setting here in this useLayoutEffect
            originalRequest._retry = true;

            // Return (re firiing) the original request but now with the new
            // updated access token whcih should clear with the backend because
            // the backend just gave us this token
            return api(originalRequest);
          } catch {
            setToken(null);
          }
        }

        return Promise.reject(error);
      }
    );
  });
};

/* -- -- - -- -- */
/* -- Helper api file (simulates backend): src/api/helpers.js -- */
const JWT_SECRET_KEY = "secret";
const jwtSecret = new TextEncoder().encode(JWT_SECRET_KEY);

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retrieve a database table
export const getDatabaseTable = (entity) => getItem(env.DB_KEY)?.[entity];

/* 
  * Wrapper for axios mock adapter that adds authentication checks 
  * This essentially wraps every single request that needs to be authenticated
    
*/
export const withAuth =
  (...data) =>
  async (config) => {
    // Check if we have a token from the config.headers.Authorization
    const token = config.headers.Authorization?.split(" ")[1];

    // Verifies the token if present
    const verified = token ? await verifyToken(token) : false;

    // Returns 403 if token is invalid and auth is enabled
    if (env.USE_AUTH && !verified) {
      return [403, { message: "Unauthorized" }];
    }

    // Calls the original mock function
    return typeof data[0] === "function" ? data[0](config) : data[0];
  };

// Verifies a JWT token using the 'jose' library
export const verifyToken = async (token, options = undefined) => {
  try {
    // Verifies the actual token. It returns either true or the
    // actual payload (because it was said that these tokens can
    // optionally have payloads of a sepcific user, and in this case
    // the payload is used to identify the user)
    const verification = await jose.jwtVerify(token, jwtSecret);

    return options?.returnPayload ? verification.payload : true;
  } catch {
    return false;
  }
};
