const Registry = artifacts.require('./Registry.sol');
const TestContract1 = artifacts.require('./TestContract1.sol');
const TestContract2 = artifacts.require('./TestContract2.sol');
// const TestContract3 = artifacts.require('./TestContract3.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

var registryContract;
var testContract1;
var testContract2;
// var testContract3;
contract('Registry', function (accounts) {
    const admin = accounts[0];

    before(async function () {
        registryContract = await Registry.new(1, { from: admin });
        console.log('Registry is deployed: ' + registryContract.address);

        const contractUpgradedEvent = registryContract.allEvents({ _from: 0 }, function (error, result) {
            if (error) assert("error occurs on event emitted");
            console.log("Event emitted: " + result.event + ", name: " + result.args.name + ", blockNumber: " + result.blockNumber);
        });
        // const contractRegisteredEvent = registryContract.LogContractRegistered({ _from: 0 }, function (error, result) {
        //     if (error) assert("error occurs on event emitted: LogContractRegistered");
        //     console.log("Event emitted: " + result.event + ", name: " + result.args.name + ", blockNumber: " + result.blockNumber);
        // });
        // const contractUpgradedEvent = registryContract.LogContractUpgraded({ _from: 0 }, function (error, result) {
        //     if (error) assert("error occurs on event emitted: LogContractUpgraded");
        //     console.log("Event emitted: " + result.event + ", name: " + result.args.name + ", blockNumber: " + result.blockNumber);
        // });
    })

    describe('check empty registry', function () {
        it('number of contract', async function () {
            assert.equal(await registryContract.size({ from: admin }), 0);
            assert.equal(await registryContract.contains("TestContract1", { from: admin }), false);
            assert.equal(await registryContract.contains("TestContract2", { from: admin }), false);
        })
    })
    describe('register TestContract1', function () {
        it('TestContract1 is deployed. version 1', async function () {
            testContract1 = await TestContract1.new(1, { from: admin });
            assert.equal(await testContract1.getName({ from: admin }), "TestContract1");
            assert.equal(await testContract1.getVersion({ from: admin }), 1);
        })
        it('before registering TestContract1', async function () {
            await registryContract.getRegistryInfo("TestContract1").should.be.rejectedWith(/revert/);
        })
        it('register TestContract1', async function () {
            await registryContract.register(testContract1.address, { from: admin }).should.be.fulfilled;

            var [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfo("TestContract1").should.be.fulfilled;
            assert.equal(name, "TestContract1");
            assert.equal(contractAddress, testContract1.address);
            assert.equal(version, 1);

            assert.equal(await registryContract.size({ from: admin }), 1);
            [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, "TestContract1");
            assert.equal(contractAddress, testContract1.address);
            assert.equal(version, 1);
        })
    })
    describe('register TestContract2', function () {
        it('TestContract2 is deployed. version 10', async function () {
            testContract2 = await TestContract2.new(10, { from: admin });
            assert.equal(await testContract2.getName({ from: admin }), "TestContract2");
            assert.equal(await testContract2.getVersion({ from: admin }), 10);
        })
        it('before registering TestContract2', async function () {
            await registryContract.getRegistryInfo("TestContract2").should.be.rejectedWith(/revert/);
        })
        it('register TestContract2', async function () {
            await registryContract.register(testContract2.address, { from: admin }).should.be.fulfilled;

            var [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfo("TestContract2").should.be.fulfilled;
            assert.equal(name, "TestContract2");
            assert.equal(contractAddress, testContract2.address);
            assert.equal(version, 10);

            assert.equal(await registryContract.size({ from: admin }), 2);
            [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, "TestContract1");
            assert.equal(contractAddress, testContract1.address);
            assert.equal(version, 1);
            [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfoByIndex(1).should.be.fulfilled;
            assert.equal(name, "TestContract2");
            assert.equal(contractAddress, testContract2.address);
            assert.equal(version, 10);
        })
    })
    describe('upgrade TestContract2', function () {
        it('upgrade TestContract2', async function () {
            testContract2 = await TestContract2.new(11, { from: admin });
            assert.equal(await testContract2.getName({ from: admin }), "TestContract2");
            assert.equal(await testContract2.getVersion({ from: admin }), 11);

            await registryContract.register(testContract2.address, { from: admin }).should.be.fulfilled;

            var [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfo("TestContract2").should.be.fulfilled;
            assert.equal(name, "TestContract2");
            assert.equal(contractAddress, testContract2.address);
            assert.equal(version, 11);
        })
        it('upgrade TestContract2 with wrong version', async function () {
            const testContract = await TestContract2.new(1, { from: admin }); // wrong version
            assert.equal(await testContract.getName({ from: admin }), "TestContract2");
            assert.equal(await testContract.getVersion({ from: admin }), 1);

            await registryContract.register(testContract.address, { from: admin }).should.be.rejectedWith(/revert/);
        })
    })
    describe('remove contracts', function () {
        it('remove TestContract1', async function () {
            await registryContract.remove("TestContract1", { from: admin }).should.be.fulfilled;

            await registryContract.getRegistryInfo("TestContract1").should.be.rejectedWith(/revert/);

            assert.equal(await registryContract.size({ from: admin }), 1);
            const [name, contractAddress, version, updatedTime] = await registryContract.getRegistryInfoByIndex(0).should.be.fulfilled;
            assert.equal(name, "TestContract2");
            assert.equal(contractAddress, testContract2.address);
            assert.equal(version, 11);
        })
    })

    after(async function () {
        // kill contracts
        await testContract1.kill({ from: admin }).should.be.fulfilled;
        await testContract2.kill({ from: admin }).should.be.fulfilled;
        await registryContract.kill({ from: admin }).should.be.fulfilled;
    })
})