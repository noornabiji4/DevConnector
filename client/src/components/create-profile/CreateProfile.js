import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TextFieldGroup from '../common/TextFieldGroup';
import TextAreaFieldGroup from '../common/TextAreaFieldGroup';
import Inputgroup from '../common/InputGroup';
import SelectListgroup from '../common/SelectListGroup';


class CreateProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displaySocialInputs: false,
            handle: '',
            company: '',
            website: '',
            location: '',
            status: '',
            skills: '',
            githubusername: '',
            bio: '',
            twitter: '',
            facebook: '',
            linkedin: '',
            youtube: '',
            instagram: '',
            errors: {}
        }
    }


    render() {
        return (
            <div className="create-profile">
                <div className="constainer">
                    <div className="row">
                        <div className="col-md-8 m-auto">
                            <h1 className="display-4 text-center"> Create Your Profile</h1>
                            <p className="lead text-center">
                                Let's get some information to make your profile sstand out
                            </p>
                            <small className="d-block pb-3"> * = require fields</small>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

CreateProfile.propTypes = {
    profile: PropTypes.object.isRequired,
    errors: PropTypes.isRequired
}

const mapStateToProps = state => ({
    profile: state.profile,
    errors: state.errors
})

export default connect(mapStateToProps)(CreateProfile)
