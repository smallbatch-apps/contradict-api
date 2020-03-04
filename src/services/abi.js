const loadStructs = abi => {
  return abi.filter(({outputs = [], name}) => {
      if(!outputs.length) return false;
      return outputs[0].type === 'tuple';
    }).reduce((structs, {name, outputs}) => {
        structs[name] = outputs[0].components;
        return structs;
    }, {});
}

const loadConstructor = abi => {
  return abi.filter(({type}) => type === 'constructor')[0];
};

const loadInterface = abi => {
  return abi.filter(({type}) => type === "function")
    .reduce((abiInterface, {inputs, outputs, name, stateMutability}) => {
      abiInterface[name] = { inputs, outputs, stateMutability};
      return abiInterface;
    }, {});
};

const loadEvents = abi => {
  return abi.filter(entry => entry.type === 'event')
    .reduce((events, {name, inputs}) => {
      events[name] = {name, inputs};
      return events;
    }, {});
};

const typeFromParameters = (string, parameters) => {
  return (parameters.find(({name}) => name === string)).type;
}

const loadAll = abi => {
  abi = JSON.parse(abi);
  return {
    events: loadEvents(abi),
    structs: loadStructs(abi),
    constructor: loadConstructor(abi),
    interface: loadInterface(abi)
  }
};

module.exports = {
  loadConstructor,
  loadInterface,
  loadStructs,
  loadEvents,
  loadAll
}