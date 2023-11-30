This is the README for the **new** API.

- level 1: This contains **ONLY** auto-generated code, created by calling "./generate_types.sh"! This contains types & and auto-generated Fetch API that we wrap with nice functions in level-2. Why do we abstract away the generated API? It contains an API class (ick) and verbose functions. App code should NEVER use level-1 code!

- level 2: TODO, but contains nice wrapper API functions and query key factories. Right now, App code should NEVER call level 2 code!

- level 3: TODO, but contains hooks for using queryClient operations (useQuery, useMutation) in a type-safe, consistent manner. Note that level 3 code is always safe to use in the App, and it uses code from both levels 1 and 2. Level 3 also exports all of the types needed for FE code using types.ts! This is to ensure that NO code from level-1 is used in our FE!

TODO level 3: maybe create pairs of queryFn/queryKey, removes need for level 2? Seems good...
Then loader functions can use both separately, custom hooks use both in same place, etc.
I think I should do this! Eliminates an entire Api level! basically replaces each of auth.ts, user.ts, etc.
Actually maybe not. start with initial approach
