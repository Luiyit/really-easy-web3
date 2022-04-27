export const msgParser = message => {
  if(!message || typeof message !== 'string') return {};

  const messageAttrs = message.substring(message.indexOf("(") + 1, message.lastIndexOf(")"))
  const list = messageAttrs.split(",");
  const attributes = list.map(attr => {
    const keyValue = attr.split("=");
    if (!validKeyValue(keyValue)) return null;
    const [key, value] = keyValue;
    
    return { key: key.trim(), value: secureEval(value) }
  });

  return attributes.reduce((data, current) => {
    if(!current) return data;
    return {...data, [current.key]: current.value }
  }, {})
} 

const validKeyValue = keyValue => {
  if (typeof keyValue !== 'object' || keyValue.length !== 2) return false;
  return true;
}

const secureEval = value => {
  try {
    return eval(value)
  } catch {
    return value
  }
}