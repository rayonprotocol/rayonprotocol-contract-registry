const Registry = artifacts.require('./Registry.sol');
const RayonProxy = artifacts.require('../../rayonprotocol-contract-common/contracts/RayonProxy.sol');
const TestScoreV1 = artifacts.require('./TestScoreV1.sol');
const TestScoreV2 = artifacts.require('./TestScoreV2.sol');
const TestScoreV3 = artifacts.require('./TestScoreV3.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

var blockNumber;
contract('Registry Contract Test', function (accounts) {
    const admin = accounts[0];

    describe('Registry map and list operations test', function () {
        var registryContract;
        var proxyContract1;
        var proxyContract2;
        var proxyContract3;
        const contractName1 = "contract1";
        const contractName2 = "contract2";
        const contractName3 = "contract3";

        before(async function () {
            registryContract = await Registry.new(1, { from: admin });
            console.log('Registry is deployed: ' + registryContract.address);

            const contractEvents = registryContract.allEvents({ _from: 0 }, function (error, result) {
                if (error) assert("error occurs on event emitted");
                console.log("Event emitted: " + result.event + ", name: " + result.args.name + ", contract: " + result.args.contractAddress + ", blockNumber: " + result.blockNumber);
            });
        })
        it('check empty registry', async function () {
            assert.equal(await registryContract.size({ from: admin }), 0);
            assert.equal(await registryContract.contains(contractName1, { from: admin }), false);
            assert.equal(await registryContract.contains(contractName2, { from: admin }), false);
            assert.equal(await registryContract.contains(contractName3, { from: admin }), false);
            await registryContract.getRegistryInfo(contractName1).should.be.rejectedWith(/revert/);
            await registryContract.getRegistryInfo(contractName2).should.be.rejectedWith(/revert/);
            await registryContract.getRegistryInfo(contractName3).should.be.rejectedWith(/revert/);
        })
        it('deploy and register RayonProxy with contractName1', async function () {
            proxyContract1 = await RayonProxy.new(contractName1, { from: admin });
            blockNumber = web3.eth.getTransaction(proxyContract1.transactionHash).blockNumber;
            assert.equal(await proxyContract1.getName({ from: admin }), contractName1);
            assert.equal(await proxyContract1.getVersion({ from: admin }), 0);

            await registryContract.register(proxyContract1.address, blockNumber).should.be.fulfilled;

            var [name, contractAddress, version, ,] = await registryContract.getRegistryInfo(contractName1).should.be.fulfilled;
            assert.equal(name, contractName1);
            assert.equal(contractAddress, proxyContract1.address);
            assert.equal(version, 0);

            assert.equal(await registryContract.size({ from: admin }), 1);
            var [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, contractName1);
            assert.equal(contractAddress, proxyContract1.address);
            assert.equal(version, 0);
        })
        it('deploy and register RayonProxy with contractName2', async function () {
            proxyContract2 = await RayonProxy.new(contractName2, { from: admin });
            blockNumber = web3.eth.getTransaction(proxyContract2.transactionHash).blockNumber;
            assert.equal(await proxyContract2.getName({ from: admin }), contractName2);
            assert.equal(await proxyContract2.getVersion({ from: admin }), 0);

            await registryContract.register(proxyContract2.address, blockNumber).should.be.fulfilled;

            var [name, contractAddress, version, ,] = await registryContract.getRegistryInfo(contractName2).should.be.fulfilled;
            assert.equal(name, contractName2);
            assert.equal(contractAddress, proxyContract2.address);
            assert.equal(version, 0);

            assert.equal(await registryContract.size({ from: admin }), 2);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, contractName1);
            assert.equal(contractAddress, proxyContract1.address);
            assert.equal(version, 0);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(1).should.be.fulfilled;
            assert.equal(name, contractName2);
            assert.equal(contractAddress, proxyContract2.address);
            assert.equal(version, 0);
        })
        it('deploy and register RayonProxy with contractName3', async function () {
            proxyContract3 = await RayonProxy.new(contractName3, { from: admin });
            blockNumber = web3.eth.getTransaction(proxyContract3.transactionHash).blockNumber;
            assert.equal(await proxyContract3.getName({ from: admin }), contractName3);
            assert.equal(await proxyContract3.getVersion({ from: admin }), 0);

            await registryContract.register(proxyContract3.address, blockNumber).should.be.fulfilled;

            var [name, contractAddress, version, ,] = await registryContract.getRegistryInfo(contractName3).should.be.fulfilled;
            assert.equal(name, contractName3);
            assert.equal(contractAddress, proxyContract3.address);
            assert.equal(version, 0);

            assert.equal(await registryContract.size({ from: admin }), 3);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, contractName1);
            assert.equal(contractAddress, proxyContract1.address);
            assert.equal(version, 0);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(1).should.be.fulfilled;
            assert.equal(name, contractName2);
            assert.equal(contractAddress, proxyContract2.address);
            assert.equal(version, 0);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(2).should.be.fulfilled;
            assert.equal(name, contractName3);
            assert.equal(contractAddress, proxyContract3.address);
            assert.equal(version, 0);
        })
        it('remove contractName1', async function () {
            await registryContract.remove(contractName1, { from: admin }).should.be.fulfilled;
            await registryContract.getRegistryInfo(contractName1).should.be.rejectedWith(/revert/);

            assert.equal(await registryContract.size({ from: admin }), 2);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, contractName3);
            assert.equal(contractAddress, proxyContract3.address);
            assert.equal(version, 0);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(1).should.be.fulfilled;
            assert.equal(name, contractName2);
            assert.equal(contractAddress, proxyContract2.address);
            assert.equal(version, 0);
        })
        it('remove contractName2', async function () {
            await registryContract.remove(contractName2, { from: admin }).should.be.fulfilled;
            await registryContract.getRegistryInfo(contractName2).should.be.rejectedWith(/revert/);

            assert.equal(await registryContract.size({ from: admin }), 1);
            [name, contractAddress, version, ,] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, contractName3);
            assert.equal(contractAddress, proxyContract3.address);
            assert.equal(version, 0);
        })
    })

    describe('Register and upgrade test with TestScore Contract', function () {
        const name = "TestScore";
        var registryContract;
        var testScoreProxy;
        var testScoreContractV1;
        var testScoreContractV2;
        var testScoreContractV3;
        var testScoreInterface;

        before(async function () {
            registryContract = await Registry.new(1, { from: admin });
            console.log('Registry is deployed: ' + registryContract.address);

            const contractEvents = registryContract.allEvents({ _from: 0 }, function (error, result) {
                if (error) assert("error occurs on event emitted");
                console.log("Event emitted: " + result.event + ", name: " + result.args.name + ", contract: " + result.args.contractAddress + ", blockNumber: " + result.blockNumber);
            });
        })
        it('check empty registry', async function () {
            assert.equal(await registryContract.size({ from: admin }), 0);
            assert.equal(await registryContract.contains("name1", { from: admin }), false);
            assert.equal(await registryContract.contains("name2", { from: admin }), false);
        })
        it('deploy TestScoreProxy', async function () {
            testScoreProxy = await RayonProxy.new(name, { from: admin });
            blockNumber = web3.eth.getTransaction(testScoreProxy.transactionHash).blockNumber;
            testScoreInterface = await TestScoreV1.at(testScoreProxy.address, { from: admin });

            assert.equal(await testScoreInterface.getName({ from: admin }), name);
            assert.equal(await testScoreInterface.getVersion({ from: admin }), 0);

            var [name1, version1, proxy1] = await registryContract.getContractInfo(testScoreInterface.address).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(version1, 0);
            assert.equal(proxy1, true);
        })
        it('register TestScore with TestScoreProxy', async function () {
            await registryContract.register(testScoreProxy.address, blockNumber).should.be.fulfilled;

            var [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfo(name).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 0);

            assert.equal(await registryContract.size({ from: admin }), 1);
            [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 0);
        })
        it('deploy TestScoreV1', async function () {
            testScoreContractV1 = await TestScoreV1.new({ from: admin });
            assert.equal(await testScoreContractV1.getName({ from: admin }), name);
            assert.equal(await testScoreContractV1.getVersion({ from: admin }), 1);

            var [name1, version1, proxy1] = await registryContract.getContractInfo(testScoreContractV1.address).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(version1, 1);
            assert.equal(proxy1, false);
        })
        it('upgrade TestScore to TestScoreV1', async function () {
            await registryContract.upgrade(testScoreContractV1.address).should.be.fulfilled;
            assert.equal(await testScoreProxy.getTargetAddress({ from: admin }), testScoreContractV1.address);

            assert.equal(await testScoreInterface.getName({ from: admin }), name);
            assert.equal(await testScoreInterface.getVersion({ from: admin }), 1);

            var [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfo(name).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 1);
        })
        it('check TestScore functions - target contract is TestScoreV1', async function () {
            assert.equal(await testScoreInterface.getScore({ from: admin }), 0);

            // hitScore : 0 -> 10
            await testScoreInterface.hitScore({ from: admin }).should.be.fulfilled;
            assert.equal(await testScoreInterface.getScore({ from: admin }), 10);

            // hitScore : 10 -> 20
            await testScoreInterface.hitScore({ from: admin }).should.be.fulfilled;
            assert.equal(await testScoreInterface.getScore({ from: admin }), 20);
        })
        it('deploy TestScoreV2', async function () {
            testScoreContractV2 = await TestScoreV2.new({ from: admin });
            assert.equal(await testScoreContractV2.getName({ from: admin }), name);
            assert.equal(await testScoreContractV2.getVersion({ from: admin }), 2);

            var [name1, version1, proxy1] = await registryContract.getContractInfo(testScoreContractV2.address).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(version1, 2);
            assert.equal(proxy1, false);
        })
        it('upgrade TestScore to TestScoreV2', async function () {
            await registryContract.upgrade(testScoreContractV2.address).should.be.fulfilled;
            assert.equal(await testScoreProxy.getTargetAddress({ from: admin }), testScoreContractV2.address);

            assert.equal(await testScoreInterface.getName({ from: admin }), name);
            assert.equal(await testScoreInterface.getVersion({ from: admin }), 2);

            var [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfo(name).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 2);
        })
        it('check TestScore functions - target contract is TestScoreV2', async function () {
            assert.equal(await testScoreInterface.getScore({ from: admin }), 20);

            // hitScore : 20 -> 40
            await testScoreInterface.hitScore({ from: admin }).should.be.fulfilled;
            assert.equal(await testScoreInterface.getScore({ from: admin }), 40);

            // hitScore : 40 -> 60
            await testScoreInterface.hitScore({ from: admin }).should.be.fulfilled;
            assert.equal(await testScoreInterface.getScore({ from: admin }), 60);
        })
        it('try to upgrade TestScore with TestScoreV1 - lower version', async function () {
            // failed to upgrade TestScore with TestScoreV1
            await registryContract.upgrade(testScoreContractV1.address).should.be.rejectedWith(/revert/);

            // current target is TestScoreV2
            assert.equal(await testScoreInterface.getName({ from: admin }), name);
            assert.equal(await testScoreInterface.getVersion({ from: admin }), 2);

            var [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfo(name).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 2);
        })
        it('deploy TestScoreV2 and try to upgrade TestScore - unmatched name', async function () {
            testScoreContractV3 = await TestScoreV3.new({ from: admin });
            assert.notEqual(await testScoreContractV3.getName({ from: admin }), name);
            assert.equal(await testScoreContractV3.getVersion({ from: admin }), 3);

            // failed to upgrade TestScore with TestScoreV2
            await registryContract.upgrade(testScoreContractV3.address).should.be.rejectedWith(/revert/);

            // current target is TestScoreV2
            assert.equal(await testScoreInterface.getName({ from: admin }), name);
            assert.equal(await testScoreInterface.getVersion({ from: admin }), 2);

            var [name1, contractAddress1, version1, blockNumber1, updatedTime1] = await registryContract.getRegistryInfo(name).should.be.fulfilled;
            assert.equal(name1, name);
            assert.equal(contractAddress1, testScoreInterface.address);
            assert.equal(version1, 2);
        })
    })
})