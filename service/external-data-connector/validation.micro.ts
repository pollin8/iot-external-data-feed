import { assertThat } from "mismatched";
import { isBoolean, isDefined, isNullOrUndefined, isNumber, isString } from "./validation";

describe('validation', ()=>{
  describe('isNullOrUndefined', function () {
    it('should return true when undefined', () => {
        assertThat(isNullOrUndefined(undefined)).is(true);
    });
    it('should return true when null', () => {
        assertThat(isNullOrUndefined(null)).is(true)
    });
    it('should return false when not undefined', () => {
        assertThat(isNullOrUndefined(1)).is(false)
    });
    it('should return false when not undefined', () => {
        assertThat(isNullOrUndefined("")).is(false)
    });
    it('should return false when not undefined', () => {
        assertThat(isNullOrUndefined({})).is(false)
    });
    it('should return false when not undefined', () => {
        assertThat(isNullOrUndefined([])).is(false)
    });

  });

  describe('isDefined', ()=>{
    it('false', () => {
      assertThat(isDefined(undefined)).is(false)
      assertThat(isDefined(null)).is(false)
    })

    it('true', () => {
      assertThat(isDefined(/a/)).is(true)
      assertThat(isDefined(0)).is(true)
      assertThat(isDefined(1)).is(true)
      assertThat(isDefined(0.0)).is(true)
      assertThat(isDefined(1.1)).is(true)
      assertThat(isDefined(3)).is(true)
      assertThat(isDefined(true)).is(true)
      assertThat(isDefined(false)).is(true)
      assertThat(isDefined(new Date())).is(true)
      assertThat(isDefined(new Error())).is(true)
    });
  })

  describe('isString()', () => {
    it('is a string', () => {
      assertThat(isString('')).is(true)
      assertThat(isString('some string')).is(true)
    });

    it('not a string', () => {
      assertThat(isString(undefined)).is(false)
      assertThat(isString(null)).is(false)
      assertThat(isString(0)).is(false)
      assertThat(isString(1)).is(false)
      assertThat(isString(0.0)).is(false)
      assertThat(isString(1.1)).is(false)
      assertThat(isString(true)).is(false)
      assertThat(isString(false)).is(false)

      assertThat(isString(/a/)).is(false)
      assertThat(isString(new Date())).is(false)
    });
  });

  describe('isNumber()', () => {

    it('is a number', () => {
      assertThat(isNumber(-1)).is(true)
      assertThat(isNumber(1)).is(true)
      assertThat(isNumber(1.3)).is(true)
    });

    it('Not a Number', () => {
      assertThat(isNumber(undefined)).is(false)
      assertThat(isNumber(NaN)).is(false)
      assertThat(isNumber(null)).is(false)
      assertThat(isNumber(/a/)).is(false)
      assertThat(isNumber(true)).is(false)
      assertThat(isNumber(false)).is(false)
      assertThat(isNumber(new Date())).is(false)
    });
  });

  describe("isBoolean", ()=>{
    it('Not a Boolean', () => {
      assertThat(isBoolean(-1)).is(false)
      assertThat(isBoolean(0)).is(false)
      assertThat(isBoolean(1)).is(false)
      assertThat(isBoolean("true")).is(false)
      assertThat(isBoolean("false")).is(false)
      assertThat(isBoolean(undefined)).is(false)
      assertThat(isBoolean(null)).is(false)
    });

    it('Is a Boolean', () => {
      assertThat(isBoolean(true)).is(true)
      assertThat(isBoolean(false)).is(true)
    });
  })
})