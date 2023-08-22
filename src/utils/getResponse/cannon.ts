import autocannon from 'autocannon';

export async function runAutocannon(config: autocannon.Options) {
  return await autocannon(config);
}
