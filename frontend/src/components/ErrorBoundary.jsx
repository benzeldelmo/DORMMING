import { Component } from "react";
import ErrorScreen from "./ErrorScreen";

/** Catches a crash anywhere below it and shows the "Something went wrong" screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    return this.state.crashed ? <ErrorScreen kind="crash" /> : this.props.children;
  }
}
