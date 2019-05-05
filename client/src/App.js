import React from 'react';
import axios from 'axios';
import ReactTable from 'react-table';
import './App.css';
import 'react-table/react-table.css';

class App extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      clubs : []
    }
  }

  componentWillMount() {

    var self = this;
    axios.get('http://localhost:8080/clubs')
        .then(function (response) {
          var clubs = response.data;
          self.setState({clubs})
        })
        .catch(function (error) {
          console.log(error);
        });


  }

  render() {

      const columns = [
      {
          Header: 'Logo du club',
          accessor: 'logo',
          Cell: ({ row }) => (<img src={'http://localhost:8080' + row.logo} />)
      },
      {
          Header: 'Nom du club',
          accessor: 'nom',
          filterable: true,
          Cell: ({ row }) => (<div class="nameClub">{row.nom}</div>)
      },
      {
          Header: 'Pays du club',
          accessor: 'pays',
          filterable: true,
          Cell: ({ row }) => (<div class="paysClub">{row.pays}</div>)
      },
      {
          Header: 'Joueurs du club',
          accessor: "joueurs",
          Cell: (joueurs) => {
              return (
                  <div class="joueurClub">
                      <p>Liste des joueurs :</p>
                       {joueurs.value.map(joueur => (
                           <div>
                               <span>Poste : {joueur.poste}, Nom : {joueur.nom}, Prenom : {joueur.prenom}, Numéro : {joueur.numero}</span>
                               <br/>
                           </div>
                       ))}
                  </div>
              )
          },
      },
      ]

      const data = this.state.clubs;

    return (
            <ReactTable
                columns={columns}
                data={data}
            />
    );
  }
}

export default App;
