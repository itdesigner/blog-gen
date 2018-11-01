---
title: The ABC Library
date: October 27th, 2018
abstract: A collection of tools and decorators used to monitor and measure performance of any typescript application.
---

## The APM (Application Performance Management)
Return to the [Main README](../README.md)


This package includes an APM object that can be used to retrieve any of the measures.  The advantage of using this object is that all measures created from it will inherit all settings provided.  These settings include and Sinks that have been set along with any options.  Of course these can be overridden at request time; but, it will reduce the need for creating sinks manually for each measure.
#### Creating APM instances
There are a number of methods that can be used to retrieve an APM instance:
* manual creation
* using the `defaultConsoleAPM` method
* using the `defaultDatadogAPM` method

```typescript
  \\manually creating an APM instance
  \\using an array of ISink
  let sinks:Array<ISink> = new Array<ISink>(new ConsoleSink());
  let apm = new APM(sinks);


  \\manually creating an APM instance
  \\using a sink function
  let sink = (s:string) => { console.log(s); };
  let apm = new APM(sink);


  \\creating a sink using the `defaultConsoleAPM` function
  let apm = defaultConsoleAPM();


  \\creating a sink using the `defaultDatadogAPM` function
  let apm = defaultDatadogAPM();
```
#### Getting m measures from APM
The APM object  allows users to retrieve a fresh measure of all supported types.

```typesript
  // create a Timer from the APM object
  let timer:ITimerMeasure = apm.timeOperation('timer name');

  // create a Counter from an APM object
  let counter:IMeasure = apm.countOperation('counter name');

  // create a Gauge from an APM object
  let gauge:IMeasure = apm.gaugeOperation('gauge name');

  //create a HealthCheck from an APM object
  let health:IMeasure = apm.healthOperation('healthcheck name');

  // create a Meter from an APM object
  let meter:IMeterMeasure = apm.meterOperation('meter name');
```

Because these measures were created using only their name, they will inherit their sinks and options from the APM object itself.  These can be overriden by supplying explicit parameters.

Return to the [Main README](../README.md)
