/*
 * Copyright (C) 2017 Tignis, Inc.
 */

'use strict';

/**
 * An Event should be generated whenever a hot dog is eaten by a competitor, and at the end of the
 * competition for each competitor.
 */
class Event {
    constructor(elapsedTime, name, totalHotDogsEaten) {
        this.elapsedTime = Number(elapsedTime);
        this.name = name;
        this.totalHotDogsEaten = Number(totalHotDogsEaten);
    }

    /**
     * Whether two Events can be considered to be identical.
     *
     * @param {Event} other The other Event.
     * @returns {boolean} True if the Events are identical.
     */
    equals(other) {
        return (
            this.elapsedTime === other.elapsedTime &&
            this.name === other.name &&
            this.totalHotDogsEaten === other.totalHotDogsEaten
        );
    }

    /**
     * Round numeric fields to 3 decimal points.
     *
     * @returns {Event} New Event with numeric fields rounded to 3 decimal points.
     */
    rounded() {
        return new Event(
            this.elapsedTime.toFixed(3),
            this.name,
            this.totalHotDogsEaten.toFixed(3)
        );
    }
}

/**
 * Implement or extend this class to simulate the competition.
 */
class YourCompetitionClass {
    /**
     * Initialize the competition.
     *
     * @param {Object} competitors A dictionary of {competitor name: hot dog function}.
     * @param {Number} duration Duration in seconds of the competition.
     */
    constructor(competitors, duration) {
	this.competitors = competitors;		// assume the dictionary will not change
	this.duration = Number(duration);
	if (this.duration < 0) {
	    throw new Error("submitted duration is negative, eh?");
	}
	this.won = undefined;			// yet
	this.unroundedEvents = undefined;	// yet
	this.events = undefined;		// yet
    }

    /**
     * Run a simulation of the competition and return a list of (or iterator over) Events. Events should be sorted by
     * elapsedTime first, then name if they have the same elapsedTime. There should be an Event for every whole hot dog
     * that is eaten by a competitor, as well as an Event for each competitor at the end of the competition. See the
     * expected results file for each testcase.
     *
     * @returns {Array} List of (or iterator over) Events.
     */
    run() {
	let events = [];

	// first create an array of unsorted events
	// by running each competitor separately
	for (let c in this.competitors) {
		for (var n = 0,				// 'n' is the number of 'whole' eaten
			elapsed = 0.0;
			elapsed += this.competitors[c](n),
			elapsed < this.duration;
			n++) {
			events.push(new Event(elapsed, c, n + 1));
	    	}

		// * the last one probably was not finished on time
		// * 'elapsed' will always be greater or equal to 'duration' here
		// * the case when 'elapsed' == 'duration' is also handled here
		// * this way we avoid double-eventing when the last hotdog
		// * exactly ends at the end of 'duration'
		let shortTime = elapsed - this.duration;		// how much time it was short to finish
		let lastTime = this.competitors[c](n);			// see how long it would have taken to do the last one
	    	n += 1.0 - shortTime / lastTime;			// a fraction of a whole one
		events.push(new Event(this.duration, c, n));
	}


	// sort the events
	events.sort(function(a, b) {
		if (a.elapsedTime < b.elapsedTime)
			return -1;
		else if (a.elapsedTime > b.elapsedTime)
			return 1;
		else 
			return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
	});

	// now round the numbers
	this.unroundedEvents = events;						// preserved the unrounded array
	this.events = events.map(e => e.rounded());
	return this.events;
    }

    /**
     * Get the winner of the competition. If multiple competitors have eaten the same number of hot dogs, the
     * competitor whose name comes first lexically is the winner.
     *
     * @returns {String} Name of winner.
     */
    winner() {
	// **** This is implementation not using sort() ****
	// It is linear, so would be faster
	let name = null;						// name of winner
	let max = 0;							// how many the winner ate
	for (let e of this.unroundedEvents) {
		if (e.totalHotDogsEaten > max ||			// this event has more hotdogs
			(e.totalHotDogsEaten == max && 			// or it has as many as 'max'
				(name === null ||			// but its name comes first "in alphabet"
				e.name.toLowerCase().localeCompare(name.toLowerCase()) < 0))) {
			max = e.totalHotDogsEaten;			// switch over 'max' and 'name'
			name = e.name;
		}
	}
	return name;

//	**** This is implementation using sort() ****
//
//	this.unroundedEvents.sort(function(a, b) {
//		if (a.totalHotDogsEaten > b.totalHotDogsEaten)
//			return -1;
//		else if (a.totalHotDogsEaten < b.totalHotDogsEaten)
//			return 1;
//		else
//			return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
//	});
//	if (this.unroundedEvents[0])			// just sanity
//		return this.unroundedEvents[0].name;
//	else
//		return undefined;
    }
}

module.exports = {
    Event: Event,
    YourCompetitionClass: YourCompetitionClass
};
