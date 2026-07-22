const trimTrailingSlash = (value) => value.replace(/\/$/, '');

export const API_BASE = trimTrailingSlash(
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1'
);

export const AGENT_API_URL = process.env.REACT_APP_AGENT_API_URL
  || 'http://localhost:8000/api/v1/agent/chat';
