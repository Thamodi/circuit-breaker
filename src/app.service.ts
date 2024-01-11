import { Injectable } from '@nestjs/common';
import { CircuitBreaker } from './circuit-breaker.service';

@Injectable()
export class AppService {
  
  executeExternalAPI(): Promise<any> {
    const axiosConfig = {
      method: 'post', 
      url: 'http://localhost:3001/execute', 
      data: {}
    };
    const circuitBreakerObject = new CircuitBreaker(axiosConfig, { failureThreshold: 4, timeout: 4000 });

    return new Promise<any>((resolve, reject) => {
      circuitBreakerObject.fire()
        .then((result) => {
          console.log('Received result:', result);
          resolve(result); 
        })
        .catch((error) => {
          console.error('Circuit breaker caught an error:', error.message);
          reject('Error occurred'); 
        });
    });
  }
}


