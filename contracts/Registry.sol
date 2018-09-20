pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";
import "../../rayonprotocol-contract-common/contracts/RayonProxy.sol";
import "../../rayonprotocol-ico/contracts/RayonToken.sol";

contract Registry is RayonBase {
    struct RegistryEntry {
        uint256 index;
        string name;
        address contractAddress;
        uint16 version;
        uint256 blockNumber;
        uint256 updatedTime;
    }
    mapping(string => RegistryEntry) internal proxyMap;
    mapping(string => mapping(uint16 => RegistryEntry)) internal contractVersionMap;
    string[] internal contractNameList;

    // Event defination
    event LogContractRegistered(string name, address contractAddress);
    event LogContractUpgraded(string name, address contractAddress);
    event LogContractRemoved(string name, address contractAddress);

    constructor(uint16 version) RayonBase("Registry", version) public {}

    function getContractInfo(address _contractAddress) public view returns(string, uint16, bool){
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonBase rayonContract = RayonBase(_contractAddress);
        return (rayonContract.getName(), rayonContract.getVersion(), rayonContract.isProxy());
    }

    function _addRegistryEntry(string memory _name, address _contractAddress, uint16 _version, uint256 _blockNumber) private {
        RegistryEntry storage entry = proxyMap[_name];
        require(!_contains(entry), "proxy to register cannot be in map");

        entry.index = contractNameList.push(_name) - 1;
        entry.name = _name;
        entry.contractAddress = _contractAddress;
        entry.version = _version;
        entry.blockNumber = _blockNumber;
        entry.updatedTime = now;
    }

    function register(address _proxyAddress, uint256 _blockNumber) public onlyOwner {
        require(_proxyAddress != address(0), "contract address cannot be 0x0");
        require(_blockNumber != 0, "blockNumber cannot be 0");
        RayonProxy rayonProxy = RayonProxy(_proxyAddress);
        require(rayonProxy.isProxy(), "contract must be RayonProxy contract");
        // require(rayonProxy.getVersion() == 0, "proxy's version must be 0");

        string memory name = rayonProxy.getName();
        uint16 version = rayonProxy.getVersion();

        _addRegistryEntry(name, _proxyAddress, version, _blockNumber);

        // target contract
        if(address(rayonProxy.getTargetAddress()) != address(0)){
            // add to contractVersionMap
        }

        // event
        emit LogContractRegistered(name, _proxyAddress);
    }

    function registerToken(address _contractAddress, uint16 _version, uint256 _blockNumber) public onlyOwner {
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonToken rayonTokenContract = RayonToken(_contractAddress);
        require(keccak256(rayonTokenContract.symbol()) == keccak256("RYN"), "checking RayonToken's symbol");
        string memory name = "RayonToken";

        _addRegistryEntry(name, _contractAddress, _version, _blockNumber);
    }

    function upgrade(address _contractAddress) public onlyOwner {
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonBase rayonContract = RayonBase(_contractAddress);
        require(!rayonContract.isProxy(), "contract cannot be RayonProxy contract");

        string memory name = rayonContract.getName();
        uint16 version = rayonContract.getVersion();

        // RegisterEntry
        RegistryEntry storage entry = proxyMap[name];
        require(_contains(entry), "contract must be in map");

        address proxyAddress = entry.contractAddress;
        RayonProxy rayonProxy = RayonProxy(proxyAddress);
        require(version > entry.version, "contract's version to register must be greater than current version");

        entry.version = version;
        entry.updatedTime = now;

        // proxy upgrade target contract
        rayonProxy.setTargetAddress(_contractAddress);

        // event
        emit LogContractUpgraded(name, _contractAddress);
    }

    function upgradeAll(address[] _contractAddressList) public onlyOwner {
        for(uint i; i<_contractAddressList.length; i++){
            upgrade(_contractAddressList[i]);
        }
    }

    function remove(string memory _name) public onlyOwner {
        RegistryEntry storage entry = proxyMap[_name];
        require(_contains(entry), "contract must be present in map");
        require(_isInRange(entry.index), "index must be in range");
        string memory deleteEntryName = entry.name;
        uint256 deleteEntryIndex = entry.index;
        address deleteEntryAddress = entry.contractAddress;

        // Move last element into the delete key slot.
        uint256 lastEntryIndex = contractNameList.length - 1;
        string memory lastEntryName = contractNameList[lastEntryIndex];
        proxyMap[lastEntryName].index = deleteEntryIndex; // proxyMap
        contractNameList[deleteEntryIndex] = contractNameList[lastEntryIndex]; // contractNameList
        contractNameList.length--;
        delete proxyMap[deleteEntryName];

        // event
        emit LogContractRemoved(deleteEntryName, deleteEntryAddress);
    }

    function getRegistryInfo(string memory _name) public view returns (string, address, uint16, uint256, uint256) {
        RegistryEntry storage entry = proxyMap[_name];
        require(_contains(entry), "contract must be present in map");
        return (entry.name, entry.contractAddress, entry.version, entry.blockNumber, entry.updatedTime);
    }

    function getRegistryInfoByIndex(uint _index) public view onlyOwner returns (string, address, uint16, uint256, uint256) {
        require(_isInRange(_index), "index must be in range");

        string memory name = contractNameList[_index];
        return getRegistryInfo(name);
    }

    function contains(string memory _name) public view returns (bool) {
        RegistryEntry storage entry = proxyMap[_name];
        return _contains(entry);
    }

    function size() public view onlyOwner returns (uint) {
        return contractNameList.length;
    }

    function _isInRange(uint256 _index) private view returns (bool) {
        return (_index >= 0) && (_index < contractNameList.length);
    }

    function _contains(RegistryEntry memory _entry) private pure returns (bool){
        return (_entry.contractAddress != address(0)) && (bytes(_entry.name).length > 0);
    }
}