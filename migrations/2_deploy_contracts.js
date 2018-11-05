const Registry = artifacts.require('./Registry.sol');

module.exports = function(deployer, network, accounts) {
  return deployer
    .then(() => {
      return deployer.deploy(Registry, 1);
    })
    .catch(error => console.error({ error }));
};
