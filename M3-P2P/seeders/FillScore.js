
'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Scores', [
            {
                wins: 3,
                userId: 1,
                createdAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString(),
                updatedAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString()
            },
            {
                wins: 2,
                userId: 6,
                createdAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString(),
                updatedAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString()
            },
            {
                wins: 2,
                userId: 4,
                createdAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString(),
                updatedAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString()
            },
            {
                wins: 1,
                userId: 5,
                createdAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString(),
                updatedAt: (new Date('18 Feb 2020 14:20:27 GMT')).toUTCString()
            }
        ]);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Scores', null, {});
    }
};