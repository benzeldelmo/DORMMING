import { describe, expect, it } from "vitest";
import { splitSentences } from "./Sentences";

describe("splitSentences", () => {
  it("splits between sentences and around a •, keeping the gaps", () => {
    expect(splitSentences("Less money confusion. More room for good memories.")).toEqual(["Less money confusion.", " ", "More room for good memories."]);
    expect(splitSentences("Vince paid • Shared with you and Sydney")).toEqual(["Vince paid", " • ", "Shared with you and Sydney"]);
    expect(splitSentences("No break here")).toEqual(["No break here"]);
  });
});
