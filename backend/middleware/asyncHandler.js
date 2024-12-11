 const asyncHadler = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};


export default asyncHadler;

