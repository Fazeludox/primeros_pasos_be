const { User, Quiz, Score } = require("./model.js").models;

// Show all quizzes in DB including <id> and <author>
exports.list = async (rl) => {

  let quizzes = await Quiz.findAll(
    {
      include: [{
        model: User,
        as: 'author'
      }]
    }
  );
  quizzes.forEach(
    q => rl.log(`  "${q.question}" (by ${q.author.name}, id=${q.id})`)
  );
}

// Create quiz with <question> and <answer> in the DB
exports.create = async (rl) => {

  let name = await rl.questionP("Enter user");
  let user = await User.findOne({ where: { name } });
  if (!user) throw new Error(`User ('${name}') doesn't exist!`);

  let question = await rl.questionP("Enter question");
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP("Enter answer");
  if (!answer) throw new Error("Response can't be empty!");

  await Quiz.create(
    {
      question,
      answer,
      authorId: user.id
    }
  );
  rl.log(`   User ${name} creates quiz: ${question} -> ${answer}`);
}

// Test (play) quiz identified by <id>
exports.test = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let quiz = await Quiz.findByPk(Number(id));
  if (!quiz) throw new Error(`  Quiz '${id}' is not in DB`);

  let answered = await rl.questionP(quiz.question);

  if (answered.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
    rl.log(`  The answer "${answered}" is right!`);
  } else {
    rl.log(`  The answer "${answered}" is wrong!`);
  }
}

// Play random

exports.play = async (rl) => {

  let countQuizz = await Quiz.count();

  let poolQuizz = [];

  for (let i = 1; i <= countQuizz; i++) {
    poolQuizz.push(i);
  }

  let score = 0;
  let status = true;

  do {

    let random = Math.floor(Math.random() * (poolQuizz.length));

    if (status) {

      poolQuizz.length === 1 ? index = 0 : index = random;

      let quiz = await Quiz.findByPk(poolQuizz[index]);

      if (quiz) {
        poolQuizz.splice(index, 1)

        let answered = await rl.questionP(quiz.question);

        if (answered.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
          rl.log(`The answer "${answered}" is right!`);
          score = score + 1;
          rl.log(`Score: ${score}`)
          if (poolQuizz.length === 0) {
            status = false;
          }

        } else {
          rl.log(`The answer "${answered}" is wrong!`);
          rl.log(`Score: ${score}`)

          status = false;
        }
      }

    } else {
      countQuizz = 0;
      let nameUser = await rl.questionP("Enter your name");
      if (!nameUser) throw new Error("Response can't be empty!")

      let found = await User.findOne({
        where: {
          name: nameUser
        }
      })

      if (found) {

        await Score.create({
          wins: score, userId: found.id, createdAt: (new Date).toUTCString()
        })

        rl.log(` User ${found.name} created with ${score} and id ${found.id}`)

      } else {
        let age = 0;

        await User.create(
          { name: nameUser, age: age }
        );

        let newUser = await User.findOne({
          where: {
            name: nameUser
          },
          include: [
            { model: Score, as: 'scores' }
          ]
        })

        await Score.create({
          wins: score, userId: newUser.id, createdAt: new Date
        })

        rl.log(` User ${newUser.name} created with ${score} and id ${newUser.id}`)
      }
    }


  } while (countQuizz !== 0);


}

// Update quiz (identified by <id>) in the DB
exports.update = async (rl) => {

  let id = await rl.questionP("Enter quizId");
  let quiz = await Quiz.findByPk(Number(id));

  let question = await rl.questionP(`Enter question (${quiz.question})`);
  if (!question) throw new Error("Response can't be empty!");

  let answer = await rl.questionP(`Enter answer (${quiz.answer})`);
  if (!answer) throw new Error("Response can't be empty!");

  quiz.question = question;
  quiz.answer = answer;
  await quiz.save({ fields: ["question", "answer"] });

  rl.log(`  Quiz ${id} updated to: ${question} -> ${answer}`);
}

// Delete quiz & favourites (with relation: onDelete: 'cascade')
exports.delete = async (rl) => {

  let id = await rl.questionP("Enter quiz Id");
  let n = await Quiz.destroy({ where: { id } });

  if (n === 0) throw new Error(`  ${id} not in DB`);
  rl.log(`  ${id} deleted from DB`);
}

