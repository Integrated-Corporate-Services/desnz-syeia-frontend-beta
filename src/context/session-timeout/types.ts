export type SessionTerminationReason =
  | 'SESSION_TIMEOUT'
  | 'SESSION_ABSOLUTE_TIMEOUT'
  | 'SESSION_EVICTED'
  | 'SESSION_GLOBAL_LOGOUT'
  | 'SESSION_BACKCHANNEL_LOGOUT';

export interface SessionTimeoutContextType {
  showModal: boolean;
  remaining: number;
  resetTimer: () => void;
  handleLogout: () => Promise<void>;
}
