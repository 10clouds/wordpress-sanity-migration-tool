# What is this script?

The script goal is to make migrating from Wordpress to Sanity easier. It allows you to generate an `.ndjson` file ready to be imported into your Sanity database.

Schemas are in line with the default Sanity gatsby starter, which you can create on https://www.sanity.io/create?template=sanity-io%2Fsanity-template-gatsby-blog

It handles a few different edge cases:
- The script will warn you of images being downloaded from google cdn (which cannot be imported using sanity-cli)
- It handles more than 100 entries per type
- It allows blocklisting broken/non-existing images
- It chunks the resulting bundle into 50 document-size files


# How to run it

1. Clone the repo

   ```
   git clone git@github.com:10clouds/wordpress-sanity-migration-tool.git
   ```

2. Generate the bundle for migration
   ```
   node index --url https://wordpress-site-url
   ```
3. Import each chunk to Sanity

   Command below must be ran from your Sanity directory ie. the one containing sanity.json!

   ```
   sanity dataset import <PATH-TO-GENERATED-NDJSON-FILE> <SANITY-DATABASE-NAME>
   ```

   It could look like this:

   ```
   sanity dataset import ../../sanity-to-wordpress-miration-tool/wordpress-data-1.ndjson production --replace
   ```

You can add flags to replace existing documents or add only missing ones

```
sanity dataset import <PATH-TO-GENERATED-NDJSON-FILE> <SANITY-DATABASE-NAME> --replace 
sanity dataset import <PATH-TO-GENERATED-NDJSON-FILE> <SANITY-DATABASE-NAME> --missing 
```

# How to use blocklist

If the media asset is not available at the source Wordpress site, then the sanity-cli will throw an error during the import. It will look similar to the one below.

You can see that the asset "https://10clouds.com/wp-content/uploads/2019/05/programisci-1024x683.jpg" is not available. If that's the case you can add it to blocklist array at [missingImagesBlockList.js](missingImagesBlockList.js) to and rerun script to ignore this asset.

```
➜  studio git:(master) ✗ sanity dataset import ../../sanity-to-wordpress-miration-tool/wordpress-data-2.ndjson production --replace
✔ [100%] Fetching available datasets
✔ [100%] Reading/validating data file (424ms)
✔ [100%] Importing documents (1.42s)
✖ [ 98%] Importing assets (files/images) (39.53s)
Error: Error while fetching asset from "https://10clouds.com/wp-content/uploads/2019/05/programisci-1024x683.jpg":
File does not exist at the specified endpoint
    at getUri (~/workspace/sanity-gatsby-blog/studio/node_modules/@sanity/import/lib/util/getHashedBufferForUri.js:44:14)
    at ClientRequest.onresponse (~/workspace/sanity-gatsby-blog/studio/node_modules/get-uri/http.js:152:14)

```

# How the script works

1. Download Wordpress media (images,thumbnails) as we will need to upload them to the new CMS.
2. Download users
3. Download categories
4. Download blogposts that will:
   1. Reference the author
   2. Reference categories
   3. Have their content be written in [portable text](https://www.sanity.io/guides/introduction-to-portable-text)
   4. Have images carried over
   5. Have additional fields (seo, dates) carried over
5. Save everything in ndjson file chunks to be consumed by sanity-cli

Ndjson is split into chunks because sanity-cli will break if the resource is temporarily unavailable. That way instead of retrying the import of 300 documents + assets, you do it only for the current chunk.

# Important notes

- Be aware that the script doesn't check whether the file provided in Wordpress actually exists which can break the Sanity import. You have to add the url to  [missingImagesBlocklist.js](missingImagesBlocklist.js)
- All images are exported as mainImage which includes alt and caption
- All errors are input into `resources.errors.log` file

# Acknowledgments

When creating this solution I've leaned heavily on [wordpress-to-sanity repository](https://github.com/kmelve/wordpress-to-sanity).

Made with :heart: by [10Clouds](https://10clouds.com/)