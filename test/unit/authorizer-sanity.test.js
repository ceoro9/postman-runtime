/* global describe, it, beforeEach, afterEach */

var _ = require('lodash'),
    expect = require('expect.js');

describe('authorizer sanity', function () {
    var Authorizer = require('../../lib/authorizer/index').Authorizer;

    it('should expose an constructor', function () {
        expect(Authorizer).to.be.a('function');
    });

    it('should be an asynchronous constructor', function (done) {
        // eslint-disable-next-line no-new
        new Authorizer(function (err, authorizer) {
            if (err) { return done(err); }

            expect(authorizer).to.be.an(Authorizer);
            done();
        });
    });

    it('should expose a create function', function (done) {
        Authorizer.create(function (err, authorizer) {
            if (err) { return done(err); }

            expect(authorizer).to.be.an(Authorizer);
            done();
        });
    });

    it('should accept interactivity options as a boolean', function (done) {
        // eslint-disable-next-line no-new
        new Authorizer({interactive: true}, function (err, authorizer) {
            if (err) { return done(err); }

            expect(authorizer).to.be.an(Authorizer);

            _.forEach(Authorizer.Handlers, function (handler, name) {
                expect(authorizer.interactive).to.have.property(name, true);
            });
            done();
        });
    });

    it('should accept interactivity options as an object', function (done) {
        var interactivity = {ntlm: true};

        // eslint-disable-next-line no-new
        new Authorizer({
            interactive: interactivity
        }, function (err, authorizer) {
            if (err) { return done(err); }

            expect(authorizer).to.be.an(Authorizer);

            expect(authorizer.interactive).to.eql(interactivity);
            done();
        });
    });

    describe('inject new auth types dynamically', function () {
        var fakeHandler = {
            init: function (context, requester, done) {
                done(null);
            },

            pre: function (context, requester, done) {
                done(null, true);
            },

            post: function (context, requester, done) {
                done(null, true);
            },

            sign: function (params, request) {
                return request;
            }
        };

        afterEach(function () {
            Authorizer.removeHandler('fake');
        });

        it('should allow dynamically injecting new auth types', function () {
            expect(Authorizer.addHandler.bind(Authorizer)).withArgs(fakeHandler, 'fake').to.not.throwException();
        });

        it('should perform validations when injecting new auth types', function () {
            expect(Authorizer.addHandler.bind(Authorizer))
                .withArgs(_.omit(fakeHandler, 'pre'), 'fake') // do not provide the "pre" callback
                .to.throwException(function (e) {
                    expect(e.message).to.match(/"pre"/);
                });
        });
    });
});
