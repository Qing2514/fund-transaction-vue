const dayjs = require('dayjs');

export const state = () => ({
  workday:dayjs().format('YYYY-MM-DD HH:mm:ss'),

});

export const mutations = {
  setWorkday(state,workday){
    state.workday = workday
  }
};
