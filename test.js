import test from 'ava';
import AppServer from '.';

test('throw if unable to connect to database', async (t) => {
    const server = new AppServer();
    const err = await t.throws(server.start());
    t.is(err.message, 'Unable to reach RethinkDB at 127.0.0.1:28015');
});
