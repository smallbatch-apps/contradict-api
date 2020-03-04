const kebabToCamelCase = string => {
  return string.replace(/-([a-z])/g, matches => {
    return matches[1].toUpperCase();
  });
}

const camelCaseToKebab = string => {
  return string.replace(/([a-z][A-Z])/g, matches => {
    return matches[0] + '-' + matches[1].toLowerCase();
  });
}


const deserializeAttributes = ({data: {attributes}}) => {
  return Object.entries(attributes).reduce((attrObject, [key, value]) => {
    attrObject[kebabToCamelCase(key)] = value;
    return attrObject;
  }, {});
}

const serializeAttributes = attributes => {

  return Object.entries(attributes).reduce((attrObject, [key, value]) => {
    attrObject[camelCaseToKebab(key)] = value;
    return attrObject;
  }, {});
}


const serializeResponse = (type, attributes, relationshipFormats = []) => {
  attributes = serializeAttributes(JSON.parse(JSON.stringify(attributes)));

  const id = attributes._id;
  delete attributes._id;

  const relationships = reduceRelationships(attributes, relationshipFormats);

  return { attributes, id, type,  relationships};
}

const singleEntityIncludes = (attributes, relationshipFormats) => {
  attributes = serializeAttributes(JSON.parse(JSON.stringify(attributes)));
  let includes = [];
  let newIncludes = [];

  relationshipFormats.forEach(({relationship, type = false, relType = 'many'}) => {
    if(!type) type = relationship;

    if (attributes[relationship]) {
      if(relType === 'many'){
        newIncludes = attributes[relationship].map(attrs => {
          attrs = serializeAttributes(attrs);
          const id = attrs._id;
          delete attrs._id;

          return { attributes: attrs, id, type };
        })
      } else {
        newIncludes = [{ id: attributes[relationship]._id, attributes: serializeAttributes(attributes[relationship]), type }]
      }

      includes = [...includes, ...newIncludes];
    }
  });
  return includes;
}

const collectionEntityIncludes = (collection, relationshipFormats) => {
  collection = JSON.parse(JSON.stringify(collection));

  let includes = [];
  let newIncludes = [];
  relationshipFormats.forEach(({relationship, type = false, relType = 'many'}) => {
    if(!type) type = relationship;

    collection.forEach(attributes => {
      if (attributes[relationship]) {
        if(relType === 'many'){
          newIncludes = attributes[relationship].map(attrs => {
            attrs = serializeAttributes(attrs);
            const id = attrs._id;
            delete attrs._id;

            return { attributes: attrs, id, type };
          })
        } else {
          newIncludes = [{ id: attributes[relationship]._id, attributes: serializeAttributes(attributes[relationship]), type }]
        }

        includes = [...includes, ...newIncludes];
      }
    })


  });
  return includes;
}

const reduceRelationships = (attributes, relationshipFormats) => {
  return relationshipFormats.reduce((relObject, {relationship, type = false, relType = 'many'}) => {
    if(!type) type = relationship;

    if(attributes[relationship]){
      if(relType === 'many') {
        relObject[relationship] = { data:  attributes[relationship].map(({_id: id}) => ({id, type})) };
      } else {
        relObject[relationship] = { data:  {id: attributes[relationship]._id, type} };
      }
      delete attributes[relationship];
    }
    return relObject;
  }, {});
}

const serializeInclude = (type, data) => {

}


module.exports = {deserializeAttributes,serializeResponse, singleEntityIncludes, kebabToCamelCase, camelCaseToKebab, collectionEntityIncludes}