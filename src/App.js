import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import Form from './components/Form';
import SignIn from './components/SignIn';
import Messages from './components/Messages';

import { providers } from 'near-api-js';
import { async } from 'regenerator-runtime/runtime';

const SUGGESTED_DONATION = '0';
const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();


const App = ({selector, currentUser, nearConfig }) => {
  const [messages, setMessages] = useState([]);

    useEffect(() => {
        console.log('a');

        const provider = new providers.JsonRpcProvider({
            url: selector.network.nodeUrl,
        });
  
        provider.query({
            request_type: "call_function",
            account_id: selector.getContractId(),
            method_name: "getMessages",
            args_base64: "",
            finality: "optimistic",
        }).then((res) => setMessages(JSON.parse(Buffer.from(res.result).toString())));
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();

        const { fieldset, message, donation } = e.target.elements;

        fieldset.disabled = true;

        // TODO: optimistically update page with new message,
        // update blockchain data in background
        // add uuid to each message, so we know which one is already known

        const provider = new providers.JsonRpcProvider({
            url: selector.network.nodeUrl,
        });

        selector.signAndSendTransaction({
            signerId: window.accountId,
            actions: [{
                type: "FunctionCall",
                params: {
                    methodName: "add_message",
                    args: {
                        text: message.value,
                    },
                    gas: BOATLOAD_OF_GAS,
                    deposit: Big(donation.value || '0').times(10 ** 24).toFixed(),
                },
            }]
        }).catch((err) => {
            alert("Failed to add message");
            throw err;

        }).then(() => {
            provider.query({
                request_type: "call_function",
                account_id: selector.getContractId(),
                method_name: "getMessages",
                args_base64: "",
                finality: "optimistic",
            }).then((res) => {
                setMessages(JSON.parse(Buffer.from(res.result).toString()))
                message.value = '';
                donation.value = SUGGESTED_DONATION;
                fieldset.disabled = false;
                message.focus();
            });
        });

    }

    const signIn = () => {
        selector.show()
    };

    const signOut = () => {
        selector.signOut();
    };

    return (
        <main>
        <header>
            <h1>NEAR Spring Challenge Task 4 Guest Book</h1>
            { currentUser
            ? <button  onClick={signOut}>Log out</button>
            : <button class="btn btn-primary" onClick={signIn}>Log in</button>
            }
        </header>
            { currentUser
                ? <Form onSubmit={onSubmit} currentUser={currentUser} />
                : <SignIn/>
            }
            { !!currentUser && !!messages.length && <Messages messages={messages}/> }
        </main>
    );
};

App.propTypes = {
    selector: PropTypes.object,
    currentUser: PropTypes.shape({
        accountId: PropTypes.string.isRequired,
        balance: PropTypes.string.isRequired
    }),
    nearConfig: PropTypes.shape({
        contractName: PropTypes.string.isRequired
    }).isRequired,
};

export default App;
