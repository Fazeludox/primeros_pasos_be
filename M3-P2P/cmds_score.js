'use strict'

const { User, Score } = require("./model.js").models;

exports.list = async (rl) => {
    let scoreboard = await Score.findAll({
        include: [{
            model: User,
            as: 'user'
        }]
    });
    scoreboard.forEach(
        s => rl.log(`${s.user.name}|${s.wins}|${s.createdAt}`)
    );
}
