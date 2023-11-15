declare namespace Express {
  // Extend the Express Request interface
  export interface Request {
    currentUser?: import('./CurrentUser').CurrentUser;
  }
}
