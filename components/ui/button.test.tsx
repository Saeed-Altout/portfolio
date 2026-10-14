import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button } from "./button"

describe("Button", () => {
  it("renders a button with its variant and size", () => {
    render(<Button variant="outline">Save</Button>)

    const button = screen.getByRole("button", { name: "Save" })
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveAttribute("data-variant", "outline")
    expect(button).toHaveAttribute("data-size", "default")
  })

  it("renders its child element with asChild", () => {
    render(
      <Button asChild>
        <a href="/contact">Contact</a>
      </Button>
    )

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "data-slot",
      "button"
    )
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
