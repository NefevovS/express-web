import {Router, urlencoded, static as staticMiddleware} from "express";
import {
    mainPage,
    detailPage,
    addPage,
    add,
    setDone,
    remove,
    setOrder,
    addendumWrapper,
    mostActiveUsers
} from "./controllers/todos.js";
import methodOverride from "method-override"
import {
    extendFlashAPI,
    getErrors,
    handleErrors,
    isGuest,
    isLoggedIn,
    loadCurrentUser,
    requestToContext
} from "./middleware.js";
import {mainErrorHandler, error500Handler} from "./error-handlers.js";
import {loginV, registerV, todoV} from "./validators.js";
import cookieParser from "cookie-parser"
import session from "express-session"
import _FileStore from "session-file-store"
import {flash} from "express-flash-message"
import {login, loginPage, logout, register, registerPage} from "./controllers/users.js";


const FileStore = _FileStore(session)


const router = Router()
router.use(session({
    store: new FileStore({
        path: "./storage/sessions", reapAsync: true, reapSyncFallback: true, fallbackSessionFn: () => {
            return {}
        }
    }), secret: "abcdefgh", resave: false, saveUninitialized: false, cookie: {
        maxAge: 1000 * 60 * 60
    }
}))
router.use(requestToContext)
router.use(flash({sessionKeyName: "flash-message"}))
router.use(extendFlashAPI)
router.use(loadCurrentUser)
router.use(cookieParser())
router.use("/uploaded",staticMiddleware("storage/uploaded"))
router.use(staticMiddleware("public"))
router.use(urlencoded({extended: true}))
router.use(methodOverride("_method"))


router.get("/register",isGuest,getErrors,registerPage)
router.post("/register",isGuest,registerV,handleErrors,register)
router.get("/login",isGuest,getErrors,loginPage)
router.post("/login",isGuest,loginV,handleErrors,login)
router.use(isLoggedIn)
router.get("/mostactive",mostActiveUsers)
router.post("/logout",logout)
router.get(`/add`,getErrors, addPage)
router.get(`/:id`, detailPage)
router.get(`/`, mainPage)
router.post(`/add`, addendumWrapper,todoV, handleErrors, add)
router.put(`/:id`, setDone)
router.delete(`/:id`, remove)
router.post('/setorder', setOrder)
router.use(mainErrorHandler, error500Handler)

export default router