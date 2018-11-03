---
title: The Measures Library
date: October 29th, 2018
abstract: A collection of tools and decorators used to monitor and measure performance of any typescript application.
type: important
tags: 
    - typescript
    - metrics
---

# measures
A collection of measure and log methods. Includes separate decorators for:
* logging synchronous methods and methods that return promises
* timing synchronous methods and methods that return promises
* execution of any measure against a synchronous method and methods that return promises
* a generic wrap to allow arbitrary encapsulating a method

The measures work in conjunction with sinks (destinations where the measure or log results) are sent.

 ## Install
    $ npm install --save measures

## API
### The Core Measures
The measures library functionality can access either via retrieving a measure from an APM instance or by directly instantiating a measure explicitly.
The placester-measures pacckage includes the following measures:
* `timer`  - a non-blocking means of capturing the duration of an event
* `counter` - a non-blocking means of counter the number of times that an event or method as occurred
* `meter` - provides a statistical means of tracking events over a period of time
* `gauge` - provides a means of recording the instantaneous value
* `healthcheck` - provides a means for returning the health or availability of a resource
* `logger` - returns a logger that can be used to log data

#### Measure IOptions
  All measures support an optional argument that allows for customization of the measures output.  The `IOptions` object supports the following parameters (all optional):

  | Option        | Type           | Types | Explanation  |
  |:------------- |:-------------|:----|:-----|
  | *correlationId*| string | All | An optional unique identifer (string) that allows for tying one or more measures together as part of a single process. |
  | *tags*      | Tag or [Tag]      | All | a collection of tags that shoukd be appended to any measure result written |
  | *cpu* | boolean      |    Timer | Determines whether the CPU utilization should be included in the measure result |
  | *mem* | boolean      |    Timer | Determines whether the memory utilization should be included in the measure result |
  | *uom* | string      |    All | Unit of measure that can be included in the measure result |
  | *directWrite* | boolean      |    Counter | Determines whether a counter should automatically write results to the current sink every time the value changes |
  | *resolution* | number     |    Counter | Works in conjunction with `directWrite` and allows for writing the value to the current sink only after this number of increment or decrement executions |

##### Sample IOptions object
```typescript
  {
      correlationId : '12345',
      cpu : true,
      mem : true,
      uom : 'access time',
      tags : [
          'some tag',
          { 'key' : 'value'}
          ...
      ]
  }
```
### Measures
See these links for details on creating and using the default measures
* [Timers](/docs/TIMER.md)
* [Counters](/docs/COUNTER.md)
* [Gauges](/docs/GAUGE.md)
* [HealthChecks](/docs/HEALTHCHECK.md)
* [Meters](/docs/METER.md)

### The APM (Application Performance Management)
This package includes an APM object that can be used to retrieve an instance of any of the measures.  The advantage of using this object is that all measures created from it will inherit all settings provided.  These settings include and Sinks that have been set along with any options.  Of course these can be overridden at request time; but, it will reduce the need for creating sinks manually for each measure.

See the [APM readme](/docs/APM.md) for more details.

### Logging
This package also includes a custom logging implementation that utilizes the same sink / sink function services as the measures.  The logger in the measures package does its best not to be awkward and get in the way.

See the [Logging readme](/docs/LOGGER.md) for more details.

### Decorators
There are 5 decorators that are included within the measures package.  Two each to support declarative logging, timers, and a generic wrap decorator for injecting your own functionality into methods.

See the [Decorators readme](/docs/DECORATORS.md) for details.