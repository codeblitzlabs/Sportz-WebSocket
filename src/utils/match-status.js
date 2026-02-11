import { MATCH_STATUS } from '../validation/matches.js';

/**
 * Determine a match's status based on its start and end times relative to a reference time.
 * @param {Date|string|number} startTime - Start time; value accepted by the Date constructor.
 * @param {Date|string|number} endTime - End time; value accepted by the Date constructor.
 * @param {Date} [now=new Date()] - Reference time to compare against start and end.
 * @returns {string|null} One of `MATCH_STATUS.SCHEDULED`, `MATCH_STATUS.LIVE`, or `MATCH_STATUS.FINISHED`; returns `null` if startTime or endTime is not a valid date.
 */
export function getMatchStatus(startTime, endTime, now = new Date())    {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return null;
    }

    if (now < start) {
        return MATCH_STATUS.SCHEDULED;
    }

    if (now >= end) {
        return MATCH_STATUS.FINISHED;
    }

    return MATCH_STATUS.LIVE;
}

/**
 * Ensure a match object's status matches the status computed from its start and end times.
 *
 * Calls `updateStatus` and updates `match.status` only when the computed status differs
 * from the current one.
 *
 * @param {Object} match - Match object containing at least `startTime`, `endTime`, and `status` properties.
 * @param {(newStatus: string) => Promise<any>} updateStatus - Async function invoked with the new status when an update is required.
 * @returns {string} The match's status after synchronization.
 */
export async function syncMatchStatus(match, updateStatus) {
    const nextStatus = getMatchStatus(match.startTime, match.endTime);
    if (!nextStatus) {
        return match.status;
    }
    if (match.status !== nextStatus) {
        await updateStatus(nextStatus);
        match.status = nextStatus;
    }
    return match.status;
}