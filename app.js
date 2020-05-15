new Vue
({
    template: 
    `
    	<div style="text-align:center;">
        <h1 style="margin: auto;">
        {{Turn}}
        </h1>
        <div>
        <h2 style="display: inline-grid;">Your color: </h2>
        <div v-bind:style="whoseturn(myid)+'margin:auto; display: inline-grid;'">
        </div>
        </div>
    	<table style="margin: auto; display: inline-block;">
    	<tr v-for='(row,index) in board' style="display: inline; "v-on:click="updateboard(index)" v-on:mouseover="hoverindex=index" v-on:mouseout="hoverindex=-1">
        <td v-bind:style="colhightlight(index)"> 
		<table>
			<tr v-for='(col, colindex) in row'>
			<td>
				<div v-bind:style="changecolor(col)"></div>
			</td>
			</tr>
		</table>
    	</td>
    	</tr>
        </table>
        <h1 v-if="restartgametag">RESTARTING GAME IN 3 SECONDS</h1>
    	</div>    
    `,
    data: {
    	board : [[0,0,0,0,0,0],
    			 [0,0,0,0,0,0],
    			 [0,0,0,0,0,0],
    			 [0,0,0,0,0,0],
    			 [0,0,0,0,0,0],
    			 [0,0,0,0,0,0],
                 [0,0,0,0,0,0]],
    	mystyles: 
    	{
    		plainstyle: "height: 25px; width: 25px; background-color: #bbb ; border-radius: 50%;",
    		player1style: "height: 25px; width: 25px; background-color: rgb(32,104,186); border-radius: 50%;",
            player2style: "height: 25px; width: 25px; background-color: rgb(0,255,0); border-radius: 50%;",
            columnhighlight: "border: 2px solid rgb(0,255,0); border-radius: 5px;",
            columndangerhighlight: "border: 2px solid rgb(255,0,0); border-radius: 5px;",
    	},
        mydanger: [],
        restartgametag : false,
        myid: 0,
        Turn: "Waiting for other player to connect",
        otherid: 0,
        iwin:false,
        hoverindex: -1,
        ws: new WebSocket('ws://localhost:8000'),
    },
    methods: {
        async sendMsg(msg) 
        {
            this.ws.send(JSON.stringify(msg));
        },
        colhightlight(index)
        {
            if(index==this.hoverindex)
            {
                if(this.presentindanger(index))
                {
                    return this.mystyles.columndangerhighlight;
                }
                else
                {
                    return this.mystyles.columnhighlight;
                }
            }
        },
        presentindanger(index)
        {
            if (this.mydanger.length == 0)
            {
                return false;
            }
            else
            {
                for (var i = 0; i < this.mydanger.length; i++)
                {
                    if(this.mydanger[i]==index)
                    {
                        return true;
                    }
                }
                return false;
            }
        },
        gamerestart(winnerid)
        {
          this.mydanger = [];  
          this.iwin = false;
          this.board = [[0,0,0,0,0,0],
                        [0,0,0,0,0,0],
                        [0,0,0,0,0,0],
                        [0,0,0,0,0,0],
                        [0,0,0,0,0,0],
                        [0,0,0,0,0,0],
                        [0,0,0,0,0,0]];
           if (this.myid == winnerid)
           {
            this.Turn = "Your Turn"; 
           } 
           else
           {
            this.Turn = "Opponent's Turn";
           }
           this.restartgametag =false;
        },
        whoseturn(id)
        {
            if (id==1)
            {
                return this.mystyles.player1style;
            }
            else if (id == 2)
            {
                return this.mystyles.player2style;
            }
        },
        changecolor(col)
        {
        	if (col==0)
        	{
        		return this.mystyles.plainstyle; 
        	}
        	else if (col == 1)
        	{
        		return this.mystyles.player1style;
        	}
            else if (col == 2)
            {
                return this.mystyles.player2style;
            }
        },
        pushindanger(row)
        {
            for (var i = 0; i < this.mydanger.length ; i++)
            {
                if (this.mydanger[i] == row)
                {
                    return;
                }
            }
            this.mydanger.push(row);
        },
        checkpossibilityofwin(id)
        {
            this.mydanger = [];
            for (var row = 0; row < 7; row++)
            {
                for (var i = 0; i<4;i++)
                {
                    if (this.board[row][i + 2] != 0 && this.board[row][i + 1] == 0)
                    {
                    	var temp = this.board[row][i]
                        this.board[row][i] = id;
                        this.ifwin(id);
                        if(this.iwin == true)
                        {
                            this.pushindanger(row);
                            this.iwin=false;
                        }
                        this.board[row][i] = temp;
                        i=4;
                    }
                    else if (this.board[row][i + 2] == 0 && i == 3)
                    {
                    	var temp=this.board[row][i+1]
                        this.board[row][i+1] = id;
                        this.ifwin(id);
                        if(this.iwin==true)
                        {
                            this.pushindanger(row);
                            this.iwin=false;
                        }
                        this.board[row][i+1] = temp;
                    }
                }
            }  
        },
        ifwin(id)
        {
            for (var row = 0; row < 7; row++)
            {
                for (var col=0; col < 6; col++)
                {
                    if(this.board[row][col] == id)
                    {
                        if(row>=3)
                        {
                            if(this.board[row-1][col] == id
                            && this.board[row-2][col] == id
                            && this.board[row-3][col] == id)
                            {
                                this.iwin=true; 
                                return;    
                            }
                            if(col>=3)
                            {
                                if(this.board[row][col-1] == id
                                && this.board[row][col-2] == id
                                && this.board[row][col-3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }
                                if(this.board[row-1][col-1] == id
                                && this.board[row-2][col-2] == id
                                && this.board[row-3][col-3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }   
                            }
                            if(col<=2)
                            {
                                if(this.board[row][col+1] == id
                                && this.board[row][col+2] == id
                                && this.board[row][col+3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }
                                if(this.board[row-1][col+1] == id
                                && this.board[row-2][col+2] == id
                                && this.board[row-3][col+3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }        
                            }
                        }
                        if(row<=3)
                        {
                            if(this.board[row+1][col] == id
                            && this.board[row+2][col] == id
                            && this.board[row+3][col] == id)
                            {
                                this.iwin=true;
                                return;
                            }
                            if(col>=3)
                            {
                                if(this.board[row][col-1] == id
                                && this.board[row][col-2] == id
                                && this.board[row][col-3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }
                                if(this.board[row+1][col-1] == id
                                && this.board[row+2][col-2] == id
                                && this.board[row+3][col-3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }    
                            }
                            if(col<=2)
                            {
                                if(this.board[row][col+1] == id
                                && this.board[row][col+2] == id
                                && this.board[row][col+3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }
                                if(this.board[row+1][col+1] == id
                                && this.board[row+2][col+2] == id
                                && this.board[row+3][col+3] == id)
                                {
                                    this.iwin=true;
                                    return;
                                }    
                            }
                        }
                    }
                }
            }
        },
        checkdraw()
        {
        	for(var i=0; i<7;i++)
        	{
        		if(this.board[i][0]==0)
        		{
        			return false;
        		}
        	}
        	return true;
        },
        updateboard(index)
        {
            if (this.Turn == "Your Turn" && this.board[index][0] == 0)
            {
                var x;
            	for (var i=0; i<5;i++)
            	{
            		if (this.board[index][i + 1] != 0)
            		{
            			this.board[index][i] = this.myid;
                        x = i;	
                        i=5;
            		}
            		else if (this.board[index][i + 1] == 0 && i == 4)
            		{
            			this.board[index][i + 1] = this.myid;
                        x= i+1;	
            		}
            	}
                this.ifwin(this.myid);
                if(this.iwin)
                {
                    this.sendMsg({type:"winner", row: index, col: x});
                    this.Turn = "You win";
                    this.restartgametag = true;
                    setTimeout(() =>{
                        this.gamerestart(this.myid)
                    }, 3000);
                }
                else if(this.checkdraw())
                {
                	this.sendMsg({type:"Draw", row: index, col: x});
                    this.Turn = "Game Draw";
                    this.restartgametag = true;
                    setTimeout(() =>{
                        this.gamerestart(this.myid)
                    }, 3000);	
                }
                else
                {
                    this.sendMsg({type:"myindex", row: index, col: x});
                    this.Turn="Opponent's Turn";
                }
            }
        }
    },
    mounted() {
        this.ws.onmessage = event => 
        {
        	if((JSON.parse(event.data)).type=="playerid")
        	{
        		this.myid=(JSON.parse(event.data)).id;
                if (this.myid == 1)
                {
                    this.otherid = 2;
                }
                else
                {
                    this.otherid = 1;
                }
                this.Turn = (JSON.parse(event.data)).turn;
        	}
            else if((JSON.parse(event.data)).type=="other's index")
            {  
                this.board[(JSON.parse(event.data)).row][(JSON.parse(event.data)).col] = this.otherid;
                this.checkpossibilityofwin(this.otherid);
                this.Turn = "Your Turn";
            }
            else if((JSON.parse(event.data)).type=="otherwin")
            {
                this.board[(JSON.parse(event.data)).row][(JSON.parse(event.data)).col] = this.otherid;
                this.Turn = "You Lost";
                this.restartgametag = true;
                setTimeout(() =>{
                        this.gamerestart(this.myid + 2)
                    }, 3000);
            }
            else if((JSON.parse(event.data)).type=="Draw")
            {
                this.board[(JSON.parse(event.data)).row][(JSON.parse(event.data)).col] = this.otherid;
                this.Turn = "Game Draw";
                this.restartgametag = true;
                setTimeout(() =>{
                        this.gamerestart(this.myid + 2)
                    }, 3000);
            }
        }
    }
}
).$mount("#root")