const bcrypt = require('bcryptjs')

async function test(params) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("mencret24/\/", salt);
    console.log(hash);
    console.log(await bcrypt.compare("mencret24/\/", hash));
    console.log(await bcrypt.compare("not_bacon", hash));
}

test()
