pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";
import "../../rayonprotocol-ico/contracts/RayonToken.sol";

contract Registry is RayonBase {
    struct RegistryEntry {
        uint256 index;
        string name;
        address contractAddress;
        uint16 version;
        uint256 updatedTime;
    }
    mapping(string => RegistryEntry) internal contractMap;
    // mapping(string => mapping(uint16 => RegistryEntry)) internal contractHistoryMap;
    string[] internal contractNameList;

    // Event defination
    event LogContractRegistered(string name, address contractAddress);
    event LogContractUpgraded(string name, address contractAddress);
    event LogContractRemoved(string name, address contractAddress);

    constructor(uint16 version) RayonBase("Registry", version) public {}

    function _registerOrUpgrade(string memory _name, address _contractAddress, uint _version) private {
        RegistryEntry storage entry = contractMap[name];
        require(version > entry.version, "version of contract to register must be greater than current version");

        entry.contractAddress = _contractAddress;
        entry.version = version;
        entry.updatedTime = now;
        if(!_contains(entry)){ // new contract
            entry.index = contractNameList.push(name) - 1;
            entry.name = name;
            emit LogContractRegistered(name, _contractAddress);

            // new proxy contract deploy
            // it will be implemented on next step
        }else{ // upgraded contract
            emit LogContractUpgraded(name, _contractAddress);
        }
    }

    function registerToken(address _contractAddress, uint16 _version) public onlyOwner {
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonToken rayonTokenContract = RayonToken(_contractAddress);
        require(keccak256(rayonTokenContract.symbol()) == keccak256("RYN"), "checking RayonToken's symbol");
        string memory name = "RayonToken";

        _registerOrUpgrade(name, _contractAddress, _version);
    }

    function register(address _contractAddress) public onlyOwner {
        require(_contractAddress != address(0), "contract address cannot be 0x0");
        RayonBase rayonContract = RayonBase(_contractAddress);
        uint16 version = rayonContract.getVersion();
        string memory name = rayonContract.getName();

        _registerOrUpgrade(name, _contractAddress, version);
    }

    function upgrade(address _contractAddress) public onlyOwner {
        register(_contractAddress);
    }

    function upgradeAll(address[] _contractAddressList) public onlyOwner {
        for(uint i; i<_contractAddressList.length; i++){
            register(_contractAddressList[i]);
        }
    }

    function remove(string memory _name) public onlyOwner {
        RegistryEntry storage entry = contractMap[_name];
        require(_contains(entry), "contract must be present in map");
        require(_isInRange(entry.index), "index must be in range");
        string memory deleteEntryName = entry.name;
        uint256 deleteEntryIndex = entry.index;
        address deleteEntryAddress = entry.contractAddress;

        // Move last element into the delete key slot.
        uint256 lastEntryIndex = contractNameList.length - 1;
        string memory lastEntryName = contractNameList[lastEntryIndex];
        contractMap[lastEntryName].index = deleteEntryIndex; // contractMap
        contractNameList[deleteEntryIndex] = contractNameList[lastEntryIndex]; // contractNameList
        contractNameList.length--;
        delete contractMap[deleteEntryName];
        emit LogContractRemoved(deleteEntryName, deleteEntryAddress);
    }

    function getRegistryInfo(string memory _name) public view returns (string, address, uint16, uint256) {
        RegistryEntry storage entry = contractMap[_name];
        require(_contains(entry), "contract must be present in map");
        return (entry.name, entry.contractAddress, entry.version, entry.updatedTime);
    }

    function getRegistryInfoByIndex(uint _index) public view onlyOwner returns (string, address, uint16, uint256) {
        require(_isInRange(_index), "index must be in range");

        string memory name = contractNameList[_index];
        return getRegistryInfo(name);
    }

    function contains(string memory _name) public view returns (bool) {
        RegistryEntry storage entry = contractMap[_name];
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