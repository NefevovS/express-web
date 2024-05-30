import {getList, getItem, addItem, setDoneItem, deleteItem} from '../models/todos.js';
import createError from "http-errors"
import {addendumUploader} from "../uploader.js";
import {join} from "node:path";
import {rm} from "node:fs/promises"
import {currentDir} from "../utility.js";


export async function mainPage(req, res) {
    const list = await getList(req.user.id, req.cookies.doneAtLast, req.query.search);
    res.render('main', {
        title: "Главная", todos: list,
    })

}

export async function detailPage(req, res, next) {
    try {
        const t = await getItem(req.params.id, req.user.id)
        if (!t) {
            throw createError(404, "Запрошенное дело не существует")
        }

        res.render("detail", {
            todo: t, title: t.title,
        })
    } catch (e) {
        next(e)
    }

}

export function errorPage(req, res) {
    res.status(404)
    res.render("404", {
        title: "Ошибка",
    })
}

export function addPage(req, res) {
    res.render("add", {title: "Добавление дела"});
}

export async function add(req, res) {
    const todo = {
        title: req.body.title, desc: req.body.desc || "", user: req.user.id
    }
    if (req.file) {
        todo.addendum = req.file.filename
    }
     await addItem(todo)
    res.redirect("/")
}

export async function setDone(req, res,next) {
    try {
        if (await setDoneItem(req.params.id, req.user.id)) {
            res.redirect("/")
        } else throw createError(404, "Запрошенное дело не существует")
    }catch (e){
        next(e)
    }



}

export async function remove(req, res, next) {
    try {
        const t = await deleteItem(req.params.id, req.user.id)
        if (!t) {
            throw createError(404, "Запрошенное дело не существует")
        }
        if (t.addendum) {
            await rm(join(currentDir, 'storage', 'uploaded', t.addendum));
        }
        res.redirect("/")
    } catch (e) {
        next(e)
    }
}

export function setOrder(req, res) {
    res.cookie("doneAtLast", req.body.done_at_last)
    res.redirect("/")
}

export function addendumWrapper(req, res, next) {
    addendumUploader(req, res, (err) => {
        if (err) if (err.code == "LIMIT_FILE_SIZE") {
            req.errorObj = {
                addendum: {
                    msg: "Допускаются файлы размером не более 100 Кбайт"
                }
            }
            next()
        } else next(err); else next();
    })
}