const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 0,
  },
});

balanceSchema.statics.withdrawBalance = async function (withdrawalAmount) {
  const balance = await this.findOne();
  if (!balance) {
    throw new Error('Saldo tidak ditemukan');
  }

  const minBalance = Math.min(balance.balance, 500000);
  const amountToWithdraw = Math.min(minBalance, withdrawalAmount);

  balance.balance -= amountToWithdraw;
  await balance.save();

  return amountToWithdraw;
};

const Balance = mongoose.model('Balance', balanceSchema);

module.exports = Balance;
