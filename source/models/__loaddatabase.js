import { connect, Schema, model } from 'mongoose';

const dbURI = process.env.DBURI || 'mongodb://127.0.0.1:27017/';
const dbName = process.env.DBNAME || 'todos';

const scTodo = new Schema({
    title: String,
    desc: String,
    addendum: String,
    user: {
        type: Schema.Types.ObjectId,
        index: true
    },
    done: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        index: true,
        default: () => new Date()
    }
}, {
    versionKey: false,
    statics: {
        async findOneAndSetDone(id, user) {
            const todo = await this.findOne({ _id: id, user: user });
            if (todo)
                await todo.setDone();
            return todo;
        }
    },
    query: {
        contains(val) {
            return this.or([
                { title: new RegExp(val, 'i') },
                { desc: new RegExp(val, 'i') }
            ]);
        }
    }
});
scTodo.index({ done: 1, createdAt: 1 });
scTodo.method('setDone', async function () {
    this.done = true;
    await this.save();
});

const scUser = new Schema({
    username: {
        type: String,
        index: true
    },
    password: Buffer,
    salt: Buffer
}, {
    versionKey: false
});

let User, Todo;

export async function connectToDB() {
    await connect(dbURI, { dbName: dbName });
    Todo = model('Todo', scTodo);
    User = model('User', scUser);
}

export { Todo, User };
