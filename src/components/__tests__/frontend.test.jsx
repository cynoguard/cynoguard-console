import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Dummy components
const DomainCard = ({ domain }) => <div>{domain}</div>;
const BotAlert = ({ message }) => <div>{message}</div>;
const DashboardCard = ({ value }) => <div>{value}</div>;

describe("Frontend Unit Testing", () => {

  test("DomainCard - Render domain info", () => {
    render(<DomainCard domain="example.com" />);
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  test("BotAlert - Render alert", () => {
    render(<BotAlert message="Bot detected!" />);
    expect(screen.getByText("Bot detected!")).toBeInTheDocument();
  });

  test("DashboardCard - Render metrics", () => {
    render(<DashboardCard value="100 Users" />);
    expect(screen.getByText("100 Users")).toBeInTheDocument();
  });

});