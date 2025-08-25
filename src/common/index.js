const backendDomain = process.env.REACT_APP_BACKEND_URL //"http://localhost:8080"

const SummaryApi = {
    userRegister : {
        url : `${backendDomain}/api/user-register`,
        method: "post"
    },
    userLogin : {
        url : `${backendDomain}/api/user-login`,
        method: "post"
    },
    userLogout : {
        url : `${backendDomain}/api/user-logout`,
        method: "post"
    },
    userProfile : {
        url : `${backendDomain}/api/get-profile`,
        method: "get"
    },
    createAccount: {
        url : `${backendDomain}/api/create-account`,
        method: "post" 
    },
    getAllAccounts: {
        url : `${backendDomain}/api/get-all-accounts`,
        method: "get" 
    },
    getAccountById: {
        url : `${backendDomain}/api/get-single-account`,
        method: "get" 
    },
    updateAccount: {
        url : `${backendDomain}/api/update-account`,
        method: "post" 
    },
    deleteAccount: {
        url : `${backendDomain}/api/delete-account`,
        method: "delete" 
    },
    getAccountBalance: {
        url : `${backendDomain}/api/get-account-balance`,
        method: "get" 
    },
    createEntry: {
         url : `${backendDomain}/api/create-entry`,
        method: "post" 
    },
    getAllEntries: {
        url : `${backendDomain}/api/get-all-entries`,
        method: "get" 
    },
    getEntriesByAccount: {
        url : `${backendDomain}/api/get-entry-by-accounts`,
        method: "get" 
    },
    getEntriesByDateRange: {
        url : `${backendDomain}/api/get-entry-by-date`,
        method: "get" 
    },
    getEntryById: {
        url : `${backendDomain}/api/get-single-entry`,
        method: "get" 
    },
    updateEntry: {
        url : `${backendDomain}/api/update-entry`,
        method: "post" 
    },
    deleteEntry: {
        url : `${backendDomain}/api/delete-entry`,
        method: "delete" 
    },
}

export default SummaryApi;