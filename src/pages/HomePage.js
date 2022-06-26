import React from 'react';
import ListPage from './ListPage';
import MealPage from './MealPage';

class HomePage extends React.Component {

    render() {
        return (
            this.props.mealViewActive ? <MealPage /> : <ListPage />
        )
    }
}

export default HomePage;