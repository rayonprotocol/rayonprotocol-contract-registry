pragma solidity ^0.4.24;

import "../../rayonprotocol-contract-common/contracts/RayonBase.sol";

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
    event LogContractRegistered(string name);
    event LogContractUpgraded(string name);

    constructor(uint16 version) RayonBase("Registry", version) public {}

    function register(address _contractAddr) public onlyOwner {
        require(_contractAddr != address(0), "contract address cannot be 0x0");
        RayonBase rayonContract = RayonBase(_contractAddr);
        uint16 version = rayonContract.getVersion();
        string memory name = rayonContract.getName();

        RegistryEntry storage entry = contractMap[name];
        require(version > entry.version, "version of contract to register must be greater than current version");
        entry.version = version;
        entry.name = name;

        if(entry.contractAddress == address(0)){ // new contract
            entry.contractAddress = _contractAddr;
            emit LogContractRegistered(name);

            // new proxy contract deploy
            // it will be implemented on next step
        }else{ // upgraded contract
            entry.contractAddress = _contractAddr;
            emit LogContractUpgraded(name);
        }

        entry.index = contractNameList.push(name);
    }

    function upgrade(address _contractAddr) public onlyOwner {
        register(_contractAddr);
    }

    function upgradeAll(address[] _contractAddrList) public onlyOwner {
        for(uint i; i<_contractAddrList.length; i++){
            register(_contractAddrList[i]);
        }
    }

    function getRegistryInfo(string memory _name) public view returns (string, address, uint16) {
        RegistryEntry storage entry = contractMap[_name];
        require(entry.contractAddress != address(0), "contract address cannot be 0x0");
        return (entry.name, entry.contractAddress, entry.version);
    }

    function getRegistryInfoByIndex(uint _index) public view returns (string, address, uint16) {
        require(_index >= 0, "index must be in range");
        require(_index < contractNameList.length, "index must be in range");

        string memory name = contractNameList[_index];
        return getRegistryInfo(name);
    }

    function size() public view returns (uint) {
        return contractNameList.length;
    }

}