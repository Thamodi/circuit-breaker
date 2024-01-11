import { Injectable } from '@nestjs/common';

const axios = require('axios');
const CircuitBreakerStates = {
  OPENED: "OPENED",
  CLOSED: "CLOSED",
  HALF: "HALF"
}

@Injectable()
export class CircuitBreaker {
  request = null;
  state = CircuitBreakerStates.CLOSED;
  failureCount = 0;
  failureThreshold = 5;
  resetAfter = 50000;
  timeout = 5000;

  constructor(request, options) {
    this.request = request;
    this.state = CircuitBreakerStates.CLOSED;
    this.failureCount = 0;
    this.resetAfter = Date.now();
    if (options) {
      this.failureThreshold = options.failureThreshold;
      this.timeout = options.timeout;
    }
    else {
      this.failureThreshold = 5;
      this.timeout = 5000;
    }
  }

  async fire() {
    if (this.state === CircuitBreakerStates.OPENED) {
      if (this.resetAfter <= Date.now()) {
        this.state = CircuitBreakerStates.HALF;
      } else {
        throw new Error('Circuit is in open state right now. Please try again later.');
      }
    }
    try {
      const response = await axios(this.request);
      if (response.status === 200) return this.success(response.data);
      return this.failure(response.data);
    }
    catch (err) {
      return this.failure(err.message);
    }
  }

  success(data) {
    this.failureCount = 0
    if (this.state === CircuitBreakerStates.HALF) {
      this.state = CircuitBreakerStates.CLOSED;
    }
    return data;
  }



  failure(data) {
    this.failureCount += 1;
    if (
      this.state === CircuitBreakerStates.HALF ||
      this.failureCount >= this.failureThreshold
    ) {
      this.state = CircuitBreakerStates.OPENED;
      this.resetAfter = Date.now() + this.timeout;
    }
    return data;
  }
}
