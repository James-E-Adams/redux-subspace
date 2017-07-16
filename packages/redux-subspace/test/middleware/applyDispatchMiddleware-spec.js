/**
 * Copyright 2016, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import applyDispatchMiddleware from '../../src/middleware/applyDispatchMiddleware'

describe('applyDispatchMiddleware Tests', () => {

    const state = {
        value: "expected"
    }

    const store = { unique: 'value' }

    const mapState = (state) => state
    const namespace = 'test'

    const subspace = {
        getState: sinon.stub().returns(state),
        dispatch: sinon.spy()
    }

    const middleware1Spy = sinon.spy()
    const middleware2Spy = sinon.spy()

    const middleware1 = (store) => (next) => (action) => {
        middleware1Spy(store)
        return next({ ...action, fromFirst: 'first value' })
    }

    const middleware2 = (store) => (next) => (action) => {
        middleware2Spy(store)
        return next({ ...action, fromSecond: 'second value' })
    }

    it('should enhance dispatch with middleware', () => {

        const createSubspace = sinon.mock().withArgs(store, mapState, namespace).returns(subspace)
        
        const enhancer = applyDispatchMiddleware(middleware1, middleware2)

        const enhancedSubspace = enhancer(createSubspace)(store, mapState, namespace)

        enhancedSubspace.dispatch({ type: "TEST" })

        expect(subspace.dispatch).to.have.been.calledWithMatch({ type: 'TEST', fromFirst: 'first value', fromSecond: 'second value' })
        expect(middleware1Spy).to.have.been.calledWith(subspace)
        expect(middleware2Spy).to.have.been.calledWith(subspace)
        expect(enhancedSubspace.getState).to.equal(subspace.getState)
    })
})
