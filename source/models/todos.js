import { Todo } from './__loaddatabase.js'

export async function getList(user, doneAtLast, search) {
    const qTodos = Todo.find({ user: user });
    if (doneAtLast === '1')
        qTodos.sort('done createdAt');
    else
        qTodos.sort('createdAt');
    if (search)
        qTodos.contains(search);
    return await qTodos;
}

export async function getItem(id, user) {
    return await Todo.findOne({ _id: id, user: user });
}

export async function addItem(todo) {
    const oTodo = new Todo(todo);
    await oTodo.save();
}

export async function setDoneItem(id, user) {
    return await Todo.findOneAndSetDone(id, user);
}

export async function deleteItem(id, user) {
    return await Todo.findOneAndDelete({ _id: id, user: user });
}

export async function getMostActiveUsers() {
    const result = [];

    result[0] = await Todo.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userObj'
            }
        },
        { $unwind: '$userObj' },
        { $group: { _id: '$userObj.username', cnt: { $count: {} } } },
        { $sort: { cnt: -1 } },
        { $limit: 3 }
    ]);

    result[1] = await Todo.aggregate([
        { $match: { done: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userObj'
            }
        },
        { $unwind: '$userObj' },
        { $group: { _id: '$userObj.username', cnt: { $count: {} } } },
        { $sort: { cnt: -1 } },
        { $limit: 3 }
    ]);

    return result;
}
