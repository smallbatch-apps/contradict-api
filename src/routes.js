
const UserController = require('./controllers/user');
const ContractController = require('./controllers/contract');
const InstanceController = require('./controllers/instance');
const ProvisioningController = require('./controllers/provisioning');
const AuthController = require('./controllers/auth');
const LiabilityController = require('./controllers/liabilities');
const WatchersService = require('./services/watchers');

WatchersService.watchForEvents();

module.exports = app => {
  app.get('/api/users', UserController.index);
  app.post('/api/users', UserController.store);
  app.get('/api/users/:id', UserController.show);
  app.patch('/api/users/:id', UserController.update);

  app.post('/api/contracts', ContractController.store);
  app.get('/api/contracts', ContractController.index);
  app.get('/api/contracts/:id', ContractController.show);
  app.delete('/api/contracts', ContractController.deleteAll);
  app.delete('/api/contracts/:id', ContractController.delete);

  app.get('/api/contracts/:id/instances', InstanceController.index);
  app.get('/api/contracts/:contractId/instances/:instanceId/:subInstanceId?', InstanceController.show);
  app.post('/api/instances', InstanceController.store);
  app.delete('/api/contracts/:contractId/instances/:instanceId', InstanceController.delete);

  app.post('/api/provisioning', ProvisioningController.store);

  app.get('/api/liabilities', LiabilityController.index);
  app.post('/api/liabilities', LiabilityController.store);

  app.post('/api/users', UserController.store);
  app.post('/api/token-auth', AuthController.authenticate);
}