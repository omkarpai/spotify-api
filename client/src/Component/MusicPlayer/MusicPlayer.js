
import React, { Component } from 'react';
import classes from './MusicPlayer.css';
import Summary from '../Summary/Summary';
import Spinner from '../UI/Spinner/Spinner';
import axios from 'axios';
import Aux from '../../hoc/Auxilary';
import Playbutton from '../../Component/UI/playButton/playButton';
import Likebutton from '../../Component/UI/likeButton/likeButton';
import Dislikebutton from '../../Component/UI/dislikeButton/dislikeButton';
import Songinfo from '../SongInfo/songInfo';


class Musicplayer extends Component {
    state ={
        songData:[],
        songStats:[],
        loading: false,
        trackno: 0,
        currentAudio: {},
        showSummary: false,
        name: "",
        artistName:"",
        albumName:"",
        image: "",
        energy: 0,
        acoustic: 0,
        dance: 0,
        spotifyTrack: "",
        spotifyArtist: ""
      }
    
      componentDidMount =()=> {
        this.setState({loading:true});
        // var config = {
        //   headers: {'Access-Control-Allow-Origin': '*'}
        // };
        axios.get('/api/getsong')
          .then(res =>{
            this.setState({loading:false});
            let songData =res.data[0];
            let songStats = res.data[1];
            this.setState({songData,songStats}, ()=> this.loadTrack() );
          });
      
      }
      
      loadTrack =()=>{
        
        let url = this.state.songData[this.state.trackno].previewurl;
        let audio = new Audio(url);
        this.nameHandler();
        this.imageHandler();
        this.setState({currentAudio: audio});
        
      }
    
      playTrackHandler =()=>{
        let audio = this.state.currentAudio;
        audio.play();
        this.setState({currentAudio: audio});
      }
    
      pauseTrackHandler =() =>{
        let audio = this.state.currentAudio;
        audio.pause();
        this.setState({currentAudio: audio});  
      }
    
      updateTrack =(trackno)=>{
        
        let update = trackno + 1;
        this.setState({trackno: update});
      }
    
      nameHandler =() => {
        
          let newname = (this.state.songData[this.state.trackno].name);
          let newalbumName = (this.state.songData[this.state.trackno].albumName);
          let newartistName = (this.state.songData[this.state.trackno].artists[0].name);
          let newSpotitrack = this.state.songData[this.state.trackno].spotify;
          let newSpotiartist = this.state.songData[this.state.trackno].artists[0].external_urls.spotify;

          this.setState({name: newname,artistName: newartistName,albumName: newalbumName,spotifyTrack: newSpotitrack,spotifyArtist: newSpotiartist});
          
      }
    
      imageHandler =() => {
        
        let newimage = (this.state.songData[this.state.trackno].images[0].url);
        this.setState({image: newimage});
        
    }
    
      
      playClickHandler = () => {
        console.log(this.state);
        if (this.state.showSummary === false)
          {
            if (this.state.trackno === 9 && this.state.currentAudio.ended)
            {this.setState({showSummary: true})}
            else
            {
              this.setState({showSummary: false});
              this.playTrackHandler();
            }
        }
        
        
  
      }
    
      likeClickHandler = () => {
        if(this.state.trackno ===9)
          {
            this.setState({showSummary: true});
            return;
          }
    
          try{
            if (this.state.songStats[this.state.trackno].error.message === "analysis not found")
              {
                return;
              }
          }
          catch (error)
          {
            let newEnergy = this.state.energy + (this.state.songStats[this.state.trackno].energy);
            let newAcoustic = this.state.acoustic + (this.state.songStats[this.state.trackno].acousticness);
            let newDance = this.state.dance + (this.state.songStats[this.state.trackno].danceability);
            this.setState({
              energy: newEnergy, 
              acoustic: newAcoustic, 
              dance: newDance },this.loadTrack);
            this.pauseTrackHandler() 
            this.updateTrack(this.state.trackno);
          }    
      }
    
      dislikeClickHandler = () => {
        
        if(this.state.trackno ===9)
          {
            this.setState({showSummary: true});
            return;
          }
    
        try{
          if (this.state.songStats[this.state.trackno].error.message === "analysis not found")
          {return}
        }
        catch (error)
          {
            let newEnergy = this.state.energy - (this.state.songStats[this.state.trackno].energy);
            let newAcoustic = this.state.acoustic - (this.state.songStats[this.state.trackno].acousticness);
            let newDance = this.state.dance - (this.state.songStats[this.state.trackno].danceability);
            this.setState({
                          energy: newEnergy, 
                          acoustic: newAcoustic, 
                          dance: newDance },this.loadTrack);
            this.pauseTrackHandler();
            this.updateTrack(this.state.trackno);
            }
      }
   
  render()
  {
    let showSpinner = null;
    let player = null;
    let summary = null;

    function max_of_three(x, y, z) 
    {
      let max_val = 0;
      if (x > y)
      {
        max_val = x;
      } else
      {
        max_val = y;
      }
      if (z > max_val) 
      {
        max_val = z;
      }
      return max_val;
    }

    if(this.state.loading){
      showSpinner = <Spinner />
    }
    else{
      player = <Aux>
                <Songinfo
                  imageLink= {this.state.image}
                  artist= {this.state.artistName}
                  songname= {this.state.name}
                  album={this.state.albumName}
                  spotifytrack={this.state.spotifyTrack}
                  spotifyartist={this.state.spotifyArtist}
                />  
                <Likebutton likeHandle={this.likeClickHandler} ></Likebutton>
                <Dislikebutton dislikeHandle= {this.dislikeClickHandler}></Dislikebutton>
                <Playbutton playHandle= {this.playClickHandler}></Playbutton>
              </Aux>
    }

    if(this.state.showSummary)
    {
    let e = this.state.energy;
    let a = this.state.acoustic;
    let d = this.state.dance;
    let text = null;

    if (max_of_three(e,a,d) === e)
    {text=" You love songs that have lots of energy... Keep Grooving" }

    if (max_of_three(e,a,d) === a)
    {text=" You love songs that are acoustic and easy to listen to.." }

    if (max_of_three(e,a,d) === d)
    {text=" You love songs that you can dance to and keep moving...." }

    if (a === 0 && e === 0 && d === 0)
    {text = "Couldnt quite get a read on you mate.....Could you please Refresh the page and try again?? "}

    summary = <Summary description={text} />
    }

        return (
            <Aux>
              {summary}
              <div className={classes.base} >
                {showSpinner}
                {/* <div className={classes.bar}></div> */}
                {player}
              </div>
            </Aux>
        )
        }
    
}

export default Musicplayer;