export const ProposalStatus = {
    Draft: 0,
    Pending: 1,
    UnderReview: 2,
    Matched: 3,
    Active: 4,
    Submitted: 5,
    Completed: 6,
    Rejected: 7
} as const;
export type ProposalStatus = (typeof ProposalStatus)[keyof typeof ProposalStatus];

export const MatchStatus = {
    InterestExpressed: 0,
    Confirmed: 1,
    Cancelled: 2,
    Withdrawn: 3
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const MeetingStatus = {
    Scheduled: 0,
    Completed: 1,
    Cancelled: 2
} as const;
export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];
