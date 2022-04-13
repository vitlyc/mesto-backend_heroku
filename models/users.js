const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак Ив Шерак',

  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Путешественник, исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator(link) {
        return /^((http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\\/])*)?/.test(

          link,
        );
      },
      message: 'Ссылка на фото пользователя',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(mail) {
        return validator.isEmail(mail);
      },
      message: 'Неверный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // необходимо добавить поле select
  },
}, {
  versionKey: false, //
});
module.exports = mongoose.model('user', userSchema);
