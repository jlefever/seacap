package net.jlefever.seacap;

import com.google.gson.annotations.SerializedName;

public class CTagsMessage
{
    @SerializedName("_type")
    private String type;

    CTagsMessage()
    {
        
    }

    public String getType()
    {
        return this.type;
    }

    public boolean isProgram()
    {
        return this.getType().equals("program");
    }

    public boolean isTag()
    {
        return this.getType().equals("tag");
    }

    public boolean isCompleted()
    {
        return this.getType().equals("completed");
    }
}
