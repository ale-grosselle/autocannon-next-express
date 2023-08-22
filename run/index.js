'use strict';

const autocannon = require('autocannon');

const withFetch =
  'http://localhost:3000/?url=https%3A%2F%2Flws.lbc.liberty-prod.classifiedscloud.io%2Fapi%2Fadvertising%2Fweb%2Fsettings%3Fpagetype%3DLBC_HOMEPAGE%26platform%3DWEB%26trafficsplitgroup%3DGROUP_A_DEFAULT';
const withHTTP =
  'http://localhost:3000/?fetch=false&&url=https%3A%2F%2Flws.lbc.liberty-prod.classifiedscloud.io%2Fapi%2Fadvertising%2Fweb%2Fsettings%3Fpagetype%3DLBC_HOMEPAGE%26platform%3DWEB%26trafficsplitgroup%3DGROUP_A_DEFAULT';
const withWorker =
  'http://localhost:3000/?worker=true&&url=https%3A%2F%2Flws.lbc.liberty-prod.classifiedscloud.io%2Fapi%2Fadvertising%2Fweb%2Fsettings%3Fpagetype%3DLBC_HOMEPAGE%26platform%3DWEB%26trafficsplitgroup%3DGROUP_A_DEFAULT';
autocannon(
  {
    url: withWorker,
    connections: 10, //default
    amount: 200, //default
    pipelining: 1, // default
  },
  console.log,
);
